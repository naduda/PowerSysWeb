package pr.rest;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;

public class TEST {
	public static void main(String[] args) throws IOException {
		File f = new File("d:/Install/PowerSys/log/20150626/Инвертор СК №93(1).log");
		final int length = (int) f.length();
		if (length != 0) {
			char[] cbuf = new char[length];
			InputStreamReader isr = new InputStreamReader(new FileInputStream(f),"CP1251");
			final int read = isr.read(cbuf); 
			String s = new String(cbuf, 0, read);
			System.out.println(s);
			isr.close();
		}
	}
}
