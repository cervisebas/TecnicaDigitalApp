import AnnotationSystem from "./ApiTecnica/annotations";
import ApiActions from "./ApiTecnica/apiactions";
import AssistSystem from "./ApiTecnica/assists";
import DirectiveSystem from "./ApiTecnica/directives";
import FamilySystem from "./ApiTecnica/family";
import GenerateRegister from "./ApiTecnica/generate-register";
import CursesGroupSystem from "./ApiTecnica/groups";
import PreferencesSystem from "./ApiTecnica/preferences";
import { RecordSystem } from "./ApiTecnica/records";
import StudentSystem from "./ApiTecnica/student";
import { keyCodeAdmin } from "./SecurityKeyCodes";

//const keyCode: string = encode('Zr4u7x!A%D*G-KaNdRgUkXp2s5v8y/B?E(H+MbQeShVmYq3t6w9z$C&F)J@NcRfU');
//const keyCodeFamily: string = encode('k3Ra4Q3HAL9MR7SAEPSNGY3mQNWsvWY2pLdLcu5LesH8rx6g2EFsrFAuCxsShbV7');
//const urlBase: string = 'http://192.168.1.34/TecnicaDigitalApi';
const urlBase: string = 'https://tecnicadigital.com.ar';

const Student = new StudentSystem(urlBase, keyCodeAdmin);
const Directive = new DirectiveSystem(urlBase, keyCodeAdmin);
const Assist = new AssistSystem(urlBase, keyCodeAdmin);
const Annotation = new AnnotationSystem(urlBase, keyCodeAdmin);
const Family = new FamilySystem(urlBase, keyCodeAdmin);
const Records = new RecordSystem(urlBase, keyCodeAdmin);
const GeneratePDF = new GenerateRegister();
const Actions = new ApiActions();
const Prefences = new PreferencesSystem(urlBase, keyCodeAdmin);
const Groups = new CursesGroupSystem(urlBase, keyCodeAdmin);

export {
    Student,
    Directive,
    urlBase,
    Assist,
    Annotation,
    Family,
    GeneratePDF,
    Actions,
    Records,
    Prefences,
    Groups
};