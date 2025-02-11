import { LOCATION } from "@/shared/config/files";

export default function metadata(data) {
  const location = data[LOCATION];
  return {
    location,
  };
}
