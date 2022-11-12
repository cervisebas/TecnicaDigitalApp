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
    existRow: boolean;
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
    credential: boolean;
};
type FamilyDataAssist = {
    id: string;
    date: string;
    hour: string;
    status: string;
    credential: boolean;
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

// Records
type RecordData = {
    id: string;
    movent: string;
    date: string;
    hour: string;
    importance: string;
    admin: {
        ok: boolean;
        cause: string;
        datas: {
            id: string;
            name: string;
            position: string;
            username: string;
            picture: string;
        };
    };
    type: string;
    section: string;
};

// Prefences
type PreferencesAssist = {
    idDirective: string;
    date: string;
    time: string;
    curses: string[];
};

// Groups
type Groups = {
    id: string;
    curse: string;
    name_group: string;
    students: string[];
};

// Matters
type Matter = {
    id: string;
    name: string;
    teacher: StudentsData;
};

// Schedules
type Schedule = {
    day: string;
    hour: string;
    group: string;
    matter: Matter | 'none';
};
type DataSchedule = {
    id: string;
    curse: string;
    data: Schedule[];
};

// Header
type ApiHeader = {
    headers: {
        Authorization: string;
        AppVersion: string;
    };
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
    FamilyDataAssist,
    RecordData,
    PreferencesAssist,
    Groups,
    Matter,
    Schedule,
    DataSchedule,
    ApiHeader
};