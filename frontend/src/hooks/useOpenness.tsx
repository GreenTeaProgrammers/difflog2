import { useAppDispatch, useAppSelector } from "../../store";

type ColorBlockProps = {
  year: number;
  month: number;
  day: number;
};

const useOpenness = ({ year, month, day }: ColorBlockProps) => {
  const selectedLocation = useAppSelector(
    (state) => state.location.selectedLocation
  );

  // コミット数を取得（仮のデータ）

  const allCommits = day / 10;
  const locationCommits = day / 20;

  const insideOpenness = locationCommits / 10;
  const outsideOpenness = allCommits / 10;

  return { insideOpenness, outsideOpenness };
};

export default useOpenness;
