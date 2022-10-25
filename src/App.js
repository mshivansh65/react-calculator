import { useReducer } from "react";
import "./styles.css";
import DigitButton from "./DigitButton";
import OperationButton from "./OperationButton";
export const ACTIONS = {
  // To add digits
  ADD_DIGIT: "add-digit",
  // To Choose operations
  CHOOSE_OPERATION: "choose-operation",
  //  To cleare all
  CLEAR: "clear-op",
  // To delete one digit and when in focous clear all
  DELETE_DIGIT: "delete-digit",
  // Too evaluate when pressed and clear all when another digit is pressed afterwords
  EVALUATE: "evaluate"
};
function evaluate({ currentOperand, previousOperand, operation }) {
  // Parse into float from string
  const prev = parseFloat(previousOperand);
  const cur = parseFloat(currentOperand);
  // Calulation
  // if No digit is found return
  if (isNaN(prev) || isNaN(cur)) return "";

  let computation = "";
  switch (operation) {
    case "*":
      computation = prev * cur;
      break;
    case "÷":
      computation = prev / cur;
      break;
    case "+":
      computation = prev + cur;
      break;
    case "-":
      computation = prev - cur;
      break;
    default:
      computation = "";
  }
  // Return number
  return computation.toString();
}
function reducer(state, { type, payload }) {
  switch (type) {
    case ACTIONS.CLEAR:
      return {};
    case ACTIONS.ADD_DIGIT:
      // in case overWrite is true add digit to current operend i.e after calculation set env for new calculation
      if (state.overWrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          overWrite: false
        };
      }
      // Prevent addition of multiple zeros intially
      if (payload.digit === "0" && state.currentOperand === "0") return state;
      // Allow addition of only one decimal
      if (payload.digit === "." && state.currentOperand.includes("."))
        return state;
      // Add digit pressed to end of current operand
      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`
      };
    case ACTIONS.CHOOSE_OPERATION:
      // If nothing available to calculate return
      if (state.currentOperand == null && state.previousOperand == null)
        return state;
      // If current operand is null and user press another action it means  user wants to chage the action
      // Change Action
      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation
        };
      }
      // If user presses an operation for first time i.e previousOperand is null
      // change operation to current payload
      // send current operand to previous operend
      // set current operand to null
      if (state.previousOperand == null)
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null
        };
      // If previous operand is not null it means user wants to calulate previous operation
      // Calulate previous operations and store it in previous operand
      // cnange current operant to null so that user cna type new number
      // store current operation for next calculation
      return {
        ...state,
        previousOperand: evaluate(state),
        currentOperand: null,
        operation: payload.operation
      };
    case ACTIONS.DELETE_DIGIT:
      // If caluclation is complete pressing del buttion will clear all
      // After clearing output set overwrite to accept new input
      if (state.overWrite) {
        return { ...state, currentOperand: null, overWrite: false };
      }
      // If noting is present in current operand do nothing
      if (state.currentOperand == null) {
        return state;
      }
      // If current operant is about to be cleared set current operand as null
      if (state.currentOperand.length === 1) {
        return { ...state, currentOperand: null };
      }
      // Else slice last digit of current operand
      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1)
      };
    case ACTIONS.EVALUATE: // logic for evaluation
      // Nothing is available return
      if (
        state.operation == null ||
        state.currentOperand == null ||
        state.previousOperand == null
      )
        return state;
      // Else set overwrite to true so that next digit pressed can overwrite this calcuation
      // set prev operand and operation to null
      // set current operand after evalating the state
      return {
        ...state,
        overWrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state)
      };
    default:
      return state;
  }
}
// for formatting
const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0 // we don't want to format decimal part because it won't allow us to add multiple zeros
});
function formatOperand(operand) {
  if (operand == null) return;
  const [integer, decimal] = operand.split(".");
  if (decimal == null) return INTEGER_FORMATTER.format(integer);
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`;
}
export default function App() {
  const [{ currentOperand, previousOperand, operation }, dispatch] = useReducer(
    reducer,
    {} //inital state
  );
  return (
    <div className="caluclator-grid">
      <div className="output">
        <div className="previous-operand">
          {formatOperand(previousOperand)}
          {operation}
        </div>
        <div className="current-operand">{formatOperand(currentOperand)}</div>
      </div>

      <button
        className="span-two"
        onClick={() =>
          dispatch({
            type: ACTIONS.CLEAR
          })
        }
      >
        AC
      </button>
      <button
        onClick={() =>
          dispatch({
            type: ACTIONS.DELETE_DIGIT
          })
        }
      >
        DEL
      </button>

      <OperationButton dispatch={dispatch} operation={"÷"} />

      <DigitButton dispatch={dispatch} digit="1" />
      <DigitButton dispatch={dispatch} digit="2" />
      <DigitButton dispatch={dispatch} digit="3" />
      <OperationButton dispatch={dispatch} operation={"*"} />
      <DigitButton dispatch={dispatch} digit="4" />
      <DigitButton dispatch={dispatch} digit="5" />
      <DigitButton dispatch={dispatch} digit="6" />
      <OperationButton dispatch={dispatch} operation={"+"} />

      <DigitButton dispatch={dispatch} digit="7" />
      <DigitButton dispatch={dispatch} digit="8" />
      <DigitButton dispatch={dispatch} digit="9" />

      <OperationButton dispatch={dispatch} operation={"-"} />
      <DigitButton dispatch={dispatch} digit="." />
      <DigitButton dispatch={dispatch} digit="0" />
      <button
        className="span-two"
        onClick={() =>
          dispatch({
            type: ACTIONS.EVALUATE
          })
        }
      >
        =
      </button>
    </div>
  );
}
