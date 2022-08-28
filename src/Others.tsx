import React, { Component } from "react";
import { DeviceEventEmitter, EmitterSubscription } from "react-native";
import ScreenLoading from "./Screens/ScreenLoading";
import Session from "./Screens/Session";
import { Actions, Directive, Family } from "./Scripts/ApiTecnica";

type IProps = {
    goCheckUpdate: ()=>any;
};
type IState = {
    showScreenLoading: boolean;
    showMessageLoading: boolean | undefined;
    messageLoading: string | undefined;
    showSessionView: boolean;
};

export default class Others extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            showScreenLoading: true,
            showMessageLoading: undefined,
            messageLoading: undefined,
            showSessionView: false
        };
        this._goTipical = this._goTipical.bind(this);
        this._setTimeoutScreenLoading = this._setTimeoutScreenLoading.bind(this);
    }
    private event1: EmitterSubscription | null = null;
    private event2: EmitterSubscription | null = null;
    private event3: EmitterSubscription | null = null;
    private event4: EmitterSubscription | null = null;
    private timeout_screenloading: number = 0;
    componentDidMount() {
        this.event1 = DeviceEventEmitter.addListener('turnScreenLoading', (data: boolean)=>this.setState({ showScreenLoading: data }));
        this.event2 = DeviceEventEmitter.addListener('turnSessionView', (data: boolean)=>this.setState({ showSessionView: data }));
        this.event3 = DeviceEventEmitter.addListener('textScreenLoading', (data: any)=>this.setState({ messageLoading: (data == null)? undefined: data, showMessageLoading: !(data == null) }));
        this.event4 = DeviceEventEmitter.addListener('reVerifySession', ()=>this.setState({ showScreenLoading: true, messageLoading: undefined, showMessageLoading: false }, ()=>this.verify()));
        this.verify();
    }
    componentWillUnmount() {
        this.event1?.remove();
        this.event2?.remove();
        this.event3?.remove();
        this.event4?.remove();
    }
    _goTipical() {
        DeviceEventEmitter.emit('loadNowAll');
        this.props.goCheckUpdate();
    }
    verify() {
        Actions.verifySession().then((opt: number)=>{
            if (opt == 0) {
                DeviceEventEmitter.emit('ChangeIndexNavigation', 'Admin');
                Directive.verify()
                    //.then(()=>this.setState({ showScreenLoading: false }, this._goTipical))
                    .then(()=>{
                        this._goTipical();
                        setTimeout(()=>{
                            this.setState({ showScreenLoading: false });
                            this.timeout_screenloading = 0;
                        }, this.timeout_screenloading)
                    })
                    .catch((action)=>this.setState({
                        showSessionView: !!action.relogin,
                        showScreenLoading: !action.relogin,
                        showMessageLoading: true,
                        messageLoading: action.cause
                    }));
            } else if (opt == 1) {
                DeviceEventEmitter.emit('ChangeIndexNavigation', 'Family');
                Family.verify()
                    .then(()=>{
                        this._goTipical();
                        setTimeout(()=>{
                            this.setState({ showScreenLoading: false });
                            this.timeout_screenloading = 0;
                        }, this.timeout_screenloading);
                    })
                    .catch((action)=>this.setState({
                        showSessionView: !!action.relogin,
                        showScreenLoading: !action.relogin,
                        showMessageLoading: true,
                        messageLoading: action.cause
                    }));
            }
        }).catch(()=>{
            DeviceEventEmitter.emit('ChangeIndexNavigation', 'Default');
            this.setState({
                showScreenLoading: false,
                showMessageLoading: undefined,
                messageLoading: undefined,
                showSessionView: true
            })
        });
    }

    // New's
    _setTimeoutScreenLoading(time: number) {
        this.timeout_screenloading = time;
    }

    render(): React.ReactNode {
        return(<>
            <Session visible={this.state.showSessionView} />
            <ScreenLoading
                visible={this.state.showScreenLoading}
                showMessage={this.state.showMessageLoading}
                message={this.state.messageLoading}
                setTimeout={this._setTimeoutScreenLoading}
            />
        </>);
    }
}