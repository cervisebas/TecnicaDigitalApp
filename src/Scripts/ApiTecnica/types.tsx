type TypicalRes = {
    ok?: boolean;
    cause?: string;
    datas?: any;
};

// Directives
type DirectiveData = {
    id: string;
    picture: string;
    username: string;
    password: string;
    date: string;
};
type ResponseDirectiveData = {
    ok?: boolean;
    cause?: string;
    datas?: DirectiveData;
};

// Students
type StudentsData = {
    id: string;
    name: string;
    dni: string;
    curse: string;
    tel: string;
    email: string;
    date: string;
    picture: string;
};
type ResponseGetAllStudents = {
    ok?: boolean;
    cause?: string;
    datas?: StudentsData[];
};
type OrderCurses = {
    label: string;
    level: number;
    students: StudentsData[];
};

// Assist
type DataGroup = {
    id: string;
    curse: string;
    date: string;
    hour: string;
    status: string;
    annotations: number;
};
type ResponseGetAllDataGroups = {
    ok?: boolean;
    cause?: string;
    datas?: DataGroup[];
};
type AssistUserData = {
    id: string;
    name: string;
    picture: string;
    status: boolean;
    idAssist: string;
    exist: boolean;
    time: string;
};
type ResponseGetAssistList = {
    ok?: boolean;
    cause?: string;
    datas?: AssistUserData[];
};
type AssistIndividualData = {
    id: string;
    date: string;
    hour: string;
    status: boolean;
};
type FamilyDataAssist = {
    id: string;
    date: string;
    hour: string;
    status: string;
    credential: string;
};

// Annotations
type AnnotationList = {
    id: string;
    group: {
        id: string;
        curse: string;
        date: string;
        hour: string;
    };
    directive: {
        id: string;
        name: string;
        position: string;
        picture: string;
    };
    date: string;
    hour: string;
    note: string;
};

// Directives
type DirectivesList = {
    id: string;
    name: string;
    position: string;
    dni: string;
    picture: string;
    username: string;
    permission: string;
};

// Others
type DataList = {
    idStudent: string;
    idAssist: string;
    check: boolean;
    exist: boolean;
};

export type {
    TypicalRes,
    DirectiveData,
    ResponseDirectiveData,
    StudentsData,
    ResponseGetAllStudents,
    OrderCurses,
    DataGroup,
    ResponseGetAllDataGroups,
    AssistUserData,
    ResponseGetAssistList,
    DataList,
    AssistIndividualData,
    AnnotationList,
    DirectivesList,
    FamilyDataAssist
};