// StepperProgress.jsx

import { Stepper } from 'react-form-stepper';

const StepperProgress = ({ steps, activeStep, ...props }) => {
  return <Stepper steps={steps} activeStep={activeStep} {...props} />;
};

export default StepperProgress;

