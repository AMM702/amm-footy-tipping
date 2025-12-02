import { interceptRegisterForm } from "./interceptRegisterForm";
import { addRadioButtonEvents } from "./addRadioButtonEvents";

// Run form intercept functions
interceptRegisterForm();

// Run other startup functions
addRadioButtonEvents();