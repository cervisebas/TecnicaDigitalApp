import AnnotationSystem from "./ApiTecnica/annotations";
import ApiActions from "./ApiTecnica/apiactions";
import AssistSystem from "./ApiTecnica/assists";
import DirectiveSystem from "./ApiTecnica/directives";
import FamilySystem from "./ApiTecnica/family";
import GenerateRegister from "./ApiTecnica/generate-register";
import CursesGroupSystem from "./ApiTecnica/groups";
import MatterScheduleSystem from "./ApiTecnica/matters";
import PreferencesSystem from "./ApiTecnica/preferences";
import { RecordSystem } from "./ApiTecnica/records";
import ScheduleSystem from "./ApiTecnica/schedule";
import StudentSystem from "./ApiTecnica/student";
import { keyCodeAdmin } from "./SecurityKeyCodes";

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
const Matters = new MatterScheduleSystem(urlBase, keyCodeAdmin);
const Schedules = new ScheduleSystem(urlBase, keyCodeAdmin);

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
    Schedules
};