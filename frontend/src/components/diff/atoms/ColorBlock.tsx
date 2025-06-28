import { Box } from "@mui/system";
import useOpacity from "../../../hooks/useOpacity";

type ColorBlockProps = {
  year: number;
  month: number;
  day: number;
};



const ColorBlock = ({ year, month, day }: ColorBlockProps) => {
  const { insideOpacity, outsideOpacity } = useOpacity({ year, month, day });
  
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        padding: "50%",
        borderRadius: 1,
        backgroundColor: `rgba(89, 141, 198, ${outsideOpacity})`,
        position: "relative",
      }}
    >
      <Box
        sx={{
          width: "65%",
          height: "65%",
          borderRadius: 1,
          backgroundColor: `rgba(215, 203, 96, ${insideOpacity})`,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        
      </Box>
    </Box>
  );
};

export default ColorBlock;
