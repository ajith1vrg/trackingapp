// TrackingState.ts

export let BACK_TO_SCHOOL = 0;

export const setBackToSchoolFlag = (val: number) => {
  BACK_TO_SCHOOL = val;
};

export const getBackToSchoolFlag = () => BACK_TO_SCHOOL;