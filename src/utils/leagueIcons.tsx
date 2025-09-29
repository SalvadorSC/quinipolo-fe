import React from "react";
import SportsVolleyballIcon from "@mui/icons-material/SportsVolleyball";
import WavesIcon from "@mui/icons-material/Waves";
import SportsBarIcon from "@mui/icons-material/SportsBar";
import PoolIcon from "@mui/icons-material/Pool";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import FilterVintageIcon from "@mui/icons-material/FilterVintage";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import FreeBreakfastIcon from "@mui/icons-material/FreeBreakfast";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import GolfCourseIcon from "@mui/icons-material/GolfCourse";
import GrainIcon from "@mui/icons-material/Grain";
import LanguageIcon from "@mui/icons-material/Language";
import LinearScaleIcon from "@mui/icons-material/LinearScale";
import LooksIcon from "@mui/icons-material/Looks";
import MoodIcon from "@mui/icons-material/Mood";
import MoodBadIcon from "@mui/icons-material/MoodBad";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import PublicIcon from "@mui/icons-material/Public";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import SportsIcon from "@mui/icons-material/Sports";
import SportsFootballIcon from "@mui/icons-material/SportsFootball";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import SportsTennisIcon from "@mui/icons-material/SportsTennis";
import SportsVolleyballIcon2 from "@mui/icons-material/SportsVolleyball";
import SportsMmaIcon from "@mui/icons-material/SportsMma";
import SportsMotorsportsIcon from "@mui/icons-material/SportsMotorsports";
import SportsHandballIcon from "@mui/icons-material/SportsHandball";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import SportsBaseballIcon from "@mui/icons-material/SportsBaseball";
import SportsCricketIcon from "@mui/icons-material/SportsCricket";
import SportsGolfIcon from "@mui/icons-material/SportsGolf";
import SportsHockeyIcon from "@mui/icons-material/SportsHockey";
import SportsKabaddiIcon from "@mui/icons-material/SportsKabaddi";
import SportsRugbyIcon from "@mui/icons-material/SportsRugby";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";

export type LeagueIconKey =
  | "sports_volleyball"
  | "waves"
  | "sports_bar"
  | "pool"
  | "emoji_events"
  | "beach_access"
  | "filter_vintage"
  | "fitness_center"
  | "free_breakfast"
  | "group_work"
  | "golf_course"
  | "grain"
  | "language"
  | "linear_scale"
  | "looks"
  | "mood"
  | "mood_bad"
  | "motorcycle"
  | "public"
  | "whatshot"
  | "wb_sunny"
  // Sports
  | "sports"
  | "sports_football"
  | "sports_soccer"
  | "sports_tennis"
  | "sports_mma"
  | "sports_motorsports"
  | "sports_handball"
  | "sports_basketball"
  | "sports_baseball"
  | "sports_cricket"
  | "sports_golf"
  | "sports_hockey"
  | "sports_kabaddi"
  | "sports_rugby"
  | "sports_esports";

export const ICON_OPTIONS: { key: LeagueIconKey; label: string }[] = [
  { key: "sports_volleyball", label: "Volleyball" },
  { key: "waves", label: "Waves" },
  { key: "sports_bar", label: "Sports Bar" },
  { key: "pool", label: "Pool" },
  { key: "emoji_events", label: "Trophy" },
  // { key: "beach_access", label: "Beach" },
  { key: "filter_vintage", label: "Flower" },
  { key: "fitness_center", label: "Dumbbell" },
  { key: "free_breakfast", label: "Cup" },
  { key: "group_work", label: "Group" },
  { key: "golf_course", label: "Golf" },
  // { key: "grain", label: "Grain" },
  { key: "language", label: "Globe" },
  // { key: "linear_scale", label: "Scale" },
  { key: "looks", label: "Looks" },
  { key: "mood", label: "Happy" },
  // { key: "mood_bad", label: "Sad" },
  { key: "motorcycle", label: "Motorcycle" },
  { key: "public", label: "Public" },
  { key: "whatshot", label: "Flame" },
  { key: "wb_sunny", label: "Sunny" },
  { key: "sports", label: "Sports" },
  { key: "sports_football", label: "Football" },
  { key: "sports_soccer", label: "Soccer" },
  { key: "sports_tennis", label: "Tennis" },
  { key: "sports_mma", label: "MMA" },
  { key: "sports_motorsports", label: "Motorsports" },
  { key: "sports_handball", label: "Handball" },
  { key: "sports_basketball", label: "Basketball" },
  { key: "sports_baseball", label: "Baseball" },
  { key: "sports_cricket", label: "Cricket" },
  { key: "sports_golf", label: "Golf" },
  // { key: "sports_hockey", label: "Hockey" },
  // { key: "sports_kabaddi", label: "Kabaddi" },
  { key: "sports_rugby", label: "Rugby" },
  { key: "sports_esports", label: "Esports" },
];

export function getLeagueIcon(
  key: LeagueIconKey | undefined,
  style?: React.CSSProperties
): React.ReactNode {
  const iconStyle = style || { color: "#3f51b5" };
  switch (key) {
    case "sports_volleyball":
      return <SportsVolleyballIcon style={iconStyle} />;
    case "waves":
      return <WavesIcon style={iconStyle} />;
    case "sports_bar":
      return <SportsBarIcon style={iconStyle} />;
    case "pool":
      return <PoolIcon style={iconStyle} />;
    case "emoji_events":
      return <EmojiEventsIcon style={iconStyle} />;
    case "beach_access":
      return <BeachAccessIcon style={iconStyle} />;
    case "filter_vintage":
      return <FilterVintageIcon style={iconStyle} />;
    case "fitness_center":
      return <FitnessCenterIcon style={iconStyle} />;
    case "free_breakfast":
      return <FreeBreakfastIcon style={iconStyle} />;
    case "group_work":
      return <GroupWorkIcon style={iconStyle} />;
    case "golf_course":
      return <GolfCourseIcon style={iconStyle} />;
    case "grain":
      return <GrainIcon style={iconStyle} />;
    case "language":
      return <LanguageIcon style={iconStyle} />;
    case "linear_scale":
      return <LinearScaleIcon style={iconStyle} />;
    case "looks":
      return <LooksIcon style={iconStyle} />;
    case "mood":
      return <MoodIcon style={iconStyle} />;
    case "mood_bad":
      return <MoodBadIcon style={iconStyle} />;
    case "motorcycle":
      return <TwoWheelerIcon style={iconStyle} />;
    case "public":
      return <PublicIcon style={iconStyle} />;
    case "whatshot":
      return <WhatshotIcon style={iconStyle} />;
    case "wb_sunny":
      return <WbSunnyIcon style={iconStyle} />;
    case "sports":
      return <SportsIcon style={iconStyle} />;
    case "sports_football":
      return <SportsFootballIcon style={iconStyle} />;
    case "sports_soccer":
      return <SportsSoccerIcon style={iconStyle} />;
    case "sports_tennis":
      return <SportsTennisIcon style={iconStyle} />;
    case "sports_mma":
      return <SportsMmaIcon style={iconStyle} />;
    case "sports_motorsports":
      return <SportsMotorsportsIcon style={iconStyle} />;
    case "sports_handball":
      return <SportsHandballIcon style={iconStyle} />;
    case "sports_basketball":
      return <SportsBasketballIcon style={iconStyle} />;
    case "sports_baseball":
      return <SportsBaseballIcon style={iconStyle} />;
    case "sports_cricket":
      return <SportsCricketIcon style={iconStyle} />;
    case "sports_golf":
      return <SportsGolfIcon style={iconStyle} />;
    case "sports_hockey":
      return <SportsHockeyIcon style={iconStyle} />;
    case "sports_kabaddi":
      return <SportsKabaddiIcon style={iconStyle} />;
    case "sports_rugby":
      return <SportsRugbyIcon style={iconStyle} />;
    case "sports_esports":
      return <SportsEsportsIcon style={iconStyle} />;
    default:
      return <SportsVolleyballIcon style={iconStyle} />;
  }
}
