import { useEffect, useState } from "react";
import { commitService } from "../../services/commitService";
import { useAppDispatch, useAppSelector } from "../../store";


type useOpacityProps = {
  year: number;
  month: number;
  day: number;
};

const useOpacity = ({ year, month, day }: useOpacityProps) =>
{
  const [allCommits, setAllCommits] = useState<number>(0);
  const [locationCommits, setLocationCommits] = useState<number>(0);


  const selectedLocation = useAppSelector(
    (state) => state.location.selectedLocation
  );

  const locationID = selectedLocation
    ? selectedLocation.id
    : "";

  useEffect(() => {
    const fetchData = async () => {
      const allCommits = await commitService.getCommitCountByLocationAndDate(
        "all",
        `${year}/${month}/${day}`
      );
      const locationCommits =
        await commitService.getCommitCountByLocationAndDate(
          locationID,
          `${year}/${month}/${day}`
        );

      setAllCommits(allCommits.commit_count);
      setLocationCommits(locationCommits.commit_count);

      // allCommits や locationCommits を使用した処理をここに追加
    };

    fetchData();
  }, [locationID, year, month, day]);


  // const allCommits = day / month;//コミットの合計数
  // const locationCommits = day / month;//特定のロケーションのコミット数

  const insideOpacity = locationCommits / 3;//内側の透明度
  const outsideOpacity = allCommits / 3;//外側の透明度

  return { insideOpacity, outsideOpacity };
};

export default useOpacity;
