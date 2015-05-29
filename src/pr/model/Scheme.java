package pr.model;

import java.util.List;
import java.util.Map;

public class Scheme {
	private int idScheme;
	private String content;
	private String background;
	private Map<String, Map<String, String>> custProps;
	private Map<Integer, List<String>> signalMap;
	
	public Scheme() {
		
	}

	public int getIdScheme() {
		return idScheme;
	}

	public void setIdScheme(int idScheme) {
		this.idScheme = idScheme;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public String getBackground() {
		return background;
	}

	public void setBackground(String background) {
		this.background = background;
	}

	public Map<String, Map<String, String>> getCustProps() {
		return custProps;
	}

	public void setCustProps(Map<String, Map<String, String>> custProps) {
		this.custProps = custProps;
	}

	public Map<Integer, List<String>> getSignalMap() {
		return signalMap;
	}

	public void setSignalMap(Map<Integer, List<String>> signalMap) {
		this.signalMap = signalMap;
	}
}
