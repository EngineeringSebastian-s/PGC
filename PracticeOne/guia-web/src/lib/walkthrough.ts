import { JUNIT_STEPS } from "@/lib/steps-junit";
import { KOTLIN_STEPS } from "@/lib/steps-kotlin";
import { SOFTTEK_STEPS } from "@/lib/steps-softtek";

export type {
  LineKind,
  OutputLine,
  Step,
  StepGroup,
  Visual,
} from "@/lib/walkthrough-types";
export { GROUP_LABEL } from "@/lib/walkthrough-types";

export const JUNIT_TRACK = [...JUNIT_STEPS, ...KOTLIN_STEPS];
export const SOFTTEK_TRACK = SOFTTEK_STEPS;
