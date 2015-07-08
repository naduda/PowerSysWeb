package pr.rest;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

@Path("/logs")
public class LogREST {
	@Produces(MediaType.TEXT_PLAIN + "; charset=UTF-8")
	@GET
	public static String qqq(@QueryParam("file") String fileName, @QueryParam("length") int length) {
		System.out.println(length);
		String ret = "File = " + fileName + "\n\n";
		List<String> arr = new ArrayList<>();

		
		try (FileInputStream is = new FileInputStream(fileName);
			 InputStreamReader isr = new InputStreamReader(is, "windows-1251");
				BufferedReader br = new BufferedReader(isr);) {

			String line;
			while ((line = br.readLine()) != null) {
				arr.add(line);
			}
			if(arr.size() > 0) {
				int low = arr.size() - length;
				if (length == 0) low = 0;
				if (low < 0) low = 0;
				for (int i = low; i < arr.size(); i++) {
					ret += arr.get(i) + "\n";
				}
			}
		} catch (IOException e) {
			File folder = new File(fileName);
			File[] listOfFiles = folder.listFiles();
			ret = "Existing files:" + "<br>";
			for (int i = 0; i < listOfFiles.length; i++) {
				if (listOfFiles[i].isFile()) {
					ret += listOfFiles[i].getName() + "<br>";
				} else if (listOfFiles[i].isDirectory()) {
					ret += "Directory " + listOfFiles[i].getName() + "\n";
				}
			}
		}
		return ret;
	}
}
