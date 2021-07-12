import { BlitzApiRequest, BlitzApiResponse } from "blitz";

export default async function healthEndpoint(req: BlitzApiRequest, res: BlitzApiResponse) {
  return res.send({
    status: "OK",
  });
}
