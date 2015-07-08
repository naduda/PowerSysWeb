package pr.rest;

import javax.json.Json;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import pr.db.ConnectDB;

@Path("/image")
public class ImageREST {
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public String getFile(@QueryParam("id") int id) {
		String data = new String(ConnectDB.getTransparantById(id).getImageByteArray());
		return Json.createObjectBuilder().add("data", data).build().toString();
	}
}