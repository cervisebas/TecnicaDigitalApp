import React, { Component, createRef } from "react";
import { DeviceEventEmitter, EmitterSubscription } from "react-native";
import ScreenLoading from "./Screens/ScreenLoading";
import Session from "./Screens/Session";
import SplashScreenAnimation from "./Screens/SplashScreenAnimation";
import { Actions, Directive, Family, Prefences } from "./Scripts/ApiTecnica";
import { waitTo } from "./Scripts/Utils";

type IProps = {
    goCheckUpdate: ()=>any;
    changeScreen: (screen: string)=>any;
};
type IState = {};

export default class Others extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this._goTipical = this._goTipical.bind(this);
        this._setTimeoutScreenLoading = this._setTimeoutScreenLoading.bind(this);
        this._reVerifySession = this._reVerifySession.bind(this);
        this._catchVerify = this._catchVerify.bind(this);
        this.verify = this.verify.bind(this);
    }
    private timeout_screenloading: number = 0;
    // Events
    private event1: EmitterSubscription | null = null;
    private event2: EmitterSubscription | null = null;
    private event3: EmitterSubscription | null = null;
    private event4: EmitterSubscription | null = null;
    // Components
    private refSession = createRef<Session>();
    private refScreenLoading = createRef<ScreenLoading>();
    
    componentDidMount() {
        this.event1 = DeviceEventEmitter.addListener('turnScreenLoading', (visible: boolean)=>(visible)? this.refScreenLoading.current?.open(): this.refScreenLoading.current?.close());
        this.event2 = DeviceEventEmitter.addListener('turnSessionView', (visible: boolean)=>(visible)? this.refSession.current?.open(): this.refSession.current?.close());
        this.event3 = DeviceEventEmitter.addListener('textScreenLoading', (message: any)=>(message !== null)? this.refScreenLoading.current?.updateMessage(message): this.refScreenLoading.current?.hideMessage());
        this.event4 = DeviceEventEmitter.addListener('reVerifySession', this._reVerifySession);
        //this.verify();
    }
    componentWillUnmount() {
        this.event1?.remove();
        this.event2?.remove();
        this.event3?.remove();
        this.event4?.remove();
    }
    _reVerifySession() {
        this.refScreenLoading.current?.open();
        this.refScreenLoading.current?.hideMessage();
        this.verify();
    }
    _goTipical() {
        DeviceEventEmitter.emit('loadNowAll');
        this.props.goCheckUpdate();
    }
    _catchVerify(action: any) {
        if (!!action.relogin) this.refSession.current?.open(); else this.refSession.current?.close();
        if (!action.relogin) this.refScreenLoading.current?.open(); else this.refScreenLoading.current?.close();
        this.refScreenLoading.current?.updateMessage(action.cause);
    }
    wait(time: number) {
        return new Promise((resolve)=>setTimeout(resolve, time));
    }
    syncPreferences() {
        return new Promise((resolve)=>{
            this.refScreenLoading.current?.updateMessage('Sincronizando preferencias...', false);
            Prefences.syncData()
                .then(async(message)=>{
                    if (message !== 'none' && message !== 'empty') {
                        this.refScreenLoading.current?.updateMessage(message, false);
                        await this.wait(1000);
                    }
                    resolve(null);
                })
                .catch(()=>resolve(null));
        });
    }
    verify() {
        Actions.verifySession().then(async(opt: number)=>{
            if (opt == 0) {
                this.refScreenLoading.current?.updateMessage('Iniciando sesión...', false)
                await waitTo(500);
                this.refScreenLoading.current?.refScreenLoadingDirective.current?.start();
                await waitTo(1000);
                this.props.changeScreen('Admin');
                Directive.verify()
                    .then(async()=>{
                        await this.syncPreferences();
                        this._goTipical();
                        //await this.wait(this.timeout_screenloading);
                        this.refScreenLoading.current?.updateMessage('Cargando...', false);
                        await waitTo(1000);
                        this.refScreenLoading.current?.close();
                    })
                    .catch(this._catchVerify);
            } else if (opt == 1) {
                this.props.changeScreen('Family');
                Family.verify()
                    .then(async()=>{
                        this._goTipical();
                        await this.wait(this.timeout_screenloading);
                        this.refScreenLoading.current?.close();
                    })
                    .catch(this._catchVerify);
            }
        }).catch(()=>{
            this.props.changeScreen('Default');
            this.refScreenLoading.current?.close();
            this.refScreenLoading.current?.hideMessage();
            this.refSession.current?.open();
        });
    }

    // New's
    _setTimeoutScreenLoading(time: number) {
        this.timeout_screenloading = time;
    }

    render(): React.ReactNode {
        return(<>
            <Session ref={this.refSession} reVerifySession={this._reVerifySession} />
            <ScreenLoading ref={this.refScreenLoading} setTimeout={this._setTimeoutScreenLoading} />
            <SplashScreenAnimation onFinish={this.verify} />
        </>);
    }
}