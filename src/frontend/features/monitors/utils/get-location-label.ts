import { LOCATIONS } from "../constants";

export default function getLocationLabel(id: string) {
  return LOCATIONS.find((l) => l.id === id)?.label ?? id.toUpperCase();
}
