import { useAppDispatch, useAppSelector } from "../../store";

type useOpacityProps = {
  year: number;
  month: number;
  day: number;
};

const useOpacity = ({ year, month, day }: useOpacityProps) => {
  const selectedLocation = useAppSelector(
    (state) => state.location.selectedLocation
  );

  // コミット数を取得（仮のデータ）

  const allCommits = day / 10;//コミットの合計数
  const locationCommits = day / 20;//特定のロケーションのコミット数

  const insideOpacity = locationCommits / 10;//内側の透明度
  const outsideOpacity = allCommits / 10;//外側の透明度

  return { insideOpacity, outsideOpacity };
};

export default useOpacity;
