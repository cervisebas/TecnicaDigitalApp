import { encode } from "base-64";
import AnnotationSystem from "./ApiTecnica/annotations";
import ApiActions from "./ApiTecnica/apiactions";
import AssistSystem from "./ApiTecnica/assists";
import DirectiveSystem from "./ApiTecnica/directives";
import FamilySystem from "./ApiTecnica/family";
import GenerateRegister from "./ApiTecnica/generate-register";
import { RecordSystem } from "./ApiTecnica/records";
import StudentSystem from "./ApiTecnica/student";

const keyCode: string = encode('Zr4u7x!A%D*G-KaNdRgUkXp2s5v8y/B?E(H+MbQeShVmYq3t6w9z$C&F)J@NcRfU');
const keyCodeFamily: string = encode('k3Ra4Q3HAL9MR7SAEPSNGY3mQNWsvWY2pLdLcu5LesH8rx6g2EFsrFAuCxsShbV7');
//const urlBase: string = 'http://192.168.1.34/TecnicaDigitalApi';
const urlBase: string = 'https://tecnica-digital.ga';

const Student = new StudentSystem(urlBase, keyCode);
const Directive = new DirectiveSystem(urlBase, keyCode);
const Assist = new AssistSystem(urlBase, keyCode);
const Annotation = new AnnotationSystem(urlBase, keyCode);
const Family = new FamilySystem(urlBase, keyCodeFamily);
const Records = new RecordSystem(urlBase, keyCode);
const GeneratePDF = new GenerateRegister();
const Actions = new ApiActions();

export {
    Student,
    Directive,
    urlBase,
    Assist,
    Annotation,
    Family,
    GeneratePDF,
    Actions,
    Records
};