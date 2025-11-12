import { Textarea } from "@mantine/core";
import { LongTextResponse } from "../../parser/types";
import { generateErrorMessage } from "./utils";
import classes from "./css/Input.module.css";
import { InputLabel } from "./InputLabel";
import { ClipboardEventHandler } from "react";

export function TextAreaInput({
  response,
  disabled,
  answer,
  index,
  enumerateQuestions,
}: {
  response: LongTextResponse;
  disabled: boolean;
  answer: { value?: string };
  index: number;
  enumerateQuestions: boolean;
}) {
  const {
    placeholder, prompt, required, secondaryText, infoText
  } = response;

  const handlePaste: ClipboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (!event) return;
    // text value does not bubble up, so if we want to caputure this at the event
    // window event listener we need to get the value here and add it to a custom attribute
    // @ts-expect-error too lazy to actually create a type for this.
    event.nativeEvent.revisitPasteValue = event.clipboardData.getData('text');
    // event.preventDefault(); // uncomment to disable paste in in this component
  };

  return (
    <Textarea
      disabled={disabled}
      placeholder={placeholder}
      label={
        prompt.length > 0 && (
          <InputLabel
            prompt={prompt}
            required={required}
            index={index}
            enumerateQuestions={enumerateQuestions}
            infoText={infoText}
          />
        )
      }
      description={secondaryText}
      onPaste={handlePaste}
      radius="md"
      size="md"
      {...answer}
      // This is necessary so the component doesnt switch from uncontrolled to controlled, which can cause issues.
      value={answer.value || ""}
      error={generateErrorMessage(response, answer)}
      withErrorStyles={required}
      errorProps={{ c: required ? "red" : "orange" }}
      classNames={{ input: classes.fixDisabled }}
    />
  );
}
