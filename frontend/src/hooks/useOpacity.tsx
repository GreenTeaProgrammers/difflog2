import { useEffect, useState } from "react";
import { commitService } from "../../services/commitService";
import { useAppSelector } from "../../store";

type useOpacityProps = {
  year: number;
  month: number;
  day: number;
};

const useOpacity = ({ year, month, day }: useOpacityProps) => {
  const [allCommits, setAllCommits] = useState<number>(0);
  const [locationCommits, setLocationCommits] = useState<number>(0);

  const selectedLocation = useAppSelector(
    (state) => state.location.selectedLocation
  );

  const locationID = selectedLocation ? selectedLocation.id : "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 日付を YYYY-MM-DD 形式にフォーマット
        const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // "all" ロケーションのコミット数を取得
        const allCommitsResponse = await commitService.getCommitCountByLocationAndDate(
          "all",
          formattedDate
        );
        setAllCommits(allCommitsResponse.commit_count);

        // 選択されたロケーションのコミット数を取得
        if (locationID) {
          const locationCommitsResponse = await commitService.getCommitCountByLocationAndDate(
            locationID,
            formattedDate
          );
          setLocationCommits(locationCommitsResponse.commit_count);
        }
      } catch (error) {
        console.error("Failed to fetch commit counts:", error);
        // エラーハンドリング: 必要に応じてエラーステートやユーザー通知を追加
      }
    };

    fetchData();
  }, [locationID, year, month, day]);

  const insideOpacity = locationCommits / 3; // 内側の透明度
  const outsideOpacity = allCommits / 3; // 外側の透明度

  return { insideOpacity, outsideOpacity };
};

export default useOpacity;
