package pr.rest;

import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import pr.db.ConnectDB;
import pr.model.LinkedValue;
import pr.server.tools.Tools;

@Path("/db")
public class DataBase {
	private static final DateFormat DATE_FORMAT = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss.SSS");
//	private static final String NUMBER_FORMAT = "0.000";
	
	@Produces(MediaType.APPLICATION_JSON)
    @GET
	public static String getSignalByIdTree(@QueryParam("id") String id) {
		return ConnectDB.getChildNodes(id);
	}
	
	@Produces(MediaType.APPLICATION_JSON)
	@Path("{comand}")
    @GET
	public static String getDataById(@PathParam("comand") String comand, 
			@QueryParam("params") String params) throws ParseException {
		
		String ret = "";
		switch (comand.toLowerCase()) {
		case "getdatabyid":
			System.out.println(params);
			String[] pArray = params.split("_");
			if (pArray.length == 1) {
				return "";
			}
			int idSignal = Integer.parseInt(pArray[0]);
			int period = Integer.parseInt(pArray[3]);
			Timestamp dtBeg = new Timestamp(DATE_FORMAT.parse(pArray[1] + " 00:00:00.000").getTime());
			Timestamp dtEnd = new Timestamp(DATE_FORMAT.parse(pArray[2] + " 00:00:00.000").getTime());;
			List<LinkedValue> data = ConnectDB.getDataIntegrArc(idSignal, dtBeg, dtEnd, period);
			
			JsonArrayBuilder dataArray = Json.createArrayBuilder();
			data.forEach(v -> {
				JsonObjectBuilder jData = Json.createObjectBuilder()
						.add("value", v.getVal().toString())
						.add("timestamp", ((Date)v.getDt()).getTime());
				dataArray.add(jData);
			});
			
			ret = Json.createObjectBuilder()
					.add("signalName", Tools.VSIGNALS.get(idSignal).getNamesignal())
					.add("data", dataArray).build().toString();
			break;
		default: ret = "Comand <" + comand + "> not found"; break;
		}
		return ret;
	}
}
