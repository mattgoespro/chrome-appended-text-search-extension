import { useCallback, useState } from "react";
import { uuid } from "../../../../shared/uuid";
import * as styles from "./append-text-options.module.scss";

type AppendTextOptionsProps = {
  appendTextOptions: string[];
  appendTextSelectedOption: string;
  onOptionSelectionChange: (option: string) => void;
};

export function AppendTextOptions(props: AppendTextOptionsProps) {
  const [selectedOption, setSelectedOption] = useState(props.appendTextSelectedOption);

  const handleOptionSelectionChange = useCallback<React.ReactEventHandler<HTMLSelectElement>>(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedOption(e.target.value);
      props.onOptionSelectionChange(e.target.value);
    },
    []
  );

  return (
    <select
      className={styles["select"]}
      value={selectedOption}
      onChange={handleOptionSelectionChange}
    >
      {props.appendTextOptions.map((option) => (
        <option className={styles["select-option"]} key={uuid()}>
          {option}
        </option>
      ))}
    </select>
  );
}
