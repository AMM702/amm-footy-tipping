// Import form intercepts
import { editPasswordFormIntercept } from "./editPasswordFormIntercept";
import { gameRoundsFormIntercept } from "../gameRoundsFormIntercept";

// Import and call this function in index.js
export function initForms()
{
    editPasswordFormIntercept();
    gameRoundsFormIntercept();
};