import AnnotationSystem from "./ApiTecnica/annotations";
import ApiActions from "./ApiTecnica/apiactions";
import AssistSystem from "./ApiTecnica/assists";
import DirectiveSystem from "./ApiTecnica/directives";
import FamilySystem from "./ApiTecnica/family";
import GenerateRegister from "./ApiTecnica/generate-register";
import CursesGroupSystem from "./ApiTecnica/groups";
import MatterScheduleSystem from "./ApiTecnica/matters";
import { OldDataSystem } from "./ApiTecnica/olddata";
import PreferencesSystem from "./ApiTecnica/preferences";
import { RecordSystem } from "./ApiTecnica/records";
import ScheduleSystem from "./ApiTecnica/schedule";
import StudentSystem from "./ApiTecnica/student";
import { SecurityHeaderAdmin, SecurityHeaderFamily } from "./SecurityKeyCodes";

//const urlBase: string = 'https://tecnicadigital.com.ar';
const urlBase: string = 'http://192.168.1.37/TecnicaDigitalApi';

const Student = new StudentSystem(urlBase, SecurityHeaderAdmin);
const Directive = new DirectiveSystem(urlBase, SecurityHeaderAdmin);
const Assist = new AssistSystem(urlBase, SecurityHeaderAdmin);
const Annotation = new AnnotationSystem(urlBase, SecurityHeaderAdmin);
const Family = new FamilySystem(urlBase, SecurityHeaderFamily);
const Records = new RecordSystem(urlBase, SecurityHeaderAdmin);
const GeneratePDF = new GenerateRegister();
const Actions = new ApiActions();
const Prefences = new PreferencesSystem(urlBase, SecurityHeaderAdmin);
const Groups = new CursesGroupSystem(urlBase, SecurityHeaderAdmin);
const Matters = new MatterScheduleSystem(urlBase, SecurityHeaderAdmin);
const Schedules = new ScheduleSystem(urlBase, SecurityHeaderAdmin);
const OldData = new OldDataSystem(urlBase, SecurityHeaderAdmin);

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
    Groups,
    Matters,
    Schedules,
    OldData
};