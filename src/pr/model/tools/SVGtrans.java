package pr.model.tools;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import pr.SVGModel;
import pr.model.Scheme;
import pr.svgObjects.G;
import pr.svgObjects.SVG;
import pr.svgObjects.Vparagraph;

public class SVGtrans {
	
	public static Scheme convert2matrix(String filePath) {
		Scheme result = new Scheme();
		String contSVG = "";
		boolean flag = true;
		int lastInd = 0;
		
		try {
			SVGModel svgModel = SVGModel.getInstance();
			SVG svg = svgModel.getSVG(filePath);
			svg.setTitle(null);
			svg.setDocumentProperties(null);
			
			String clazz = svg.getG().get(0).getListG().get(0).getlRect().get(0).getClazz();
			String fill = svg.getStyleByName(clazz);
			fill = fill.substring(fill.indexOf("fill"));
			fill = fill.substring(0, fill.indexOf(";"));
			fill = fill.substring(fill.indexOf(":") + 1);
			
			Map<String, Map<String, String>> custProps = new HashMap<>();
			Map<Integer, List<String>> signalMap = new HashMap<>();
			svg.getG().forEach(g -> clean(svg, g, custProps, signalMap));
			contSVG = svgModel.setObject(svg);
			
			result.setBackground(fill);
			result.setCustProps(custProps);
			result.setSignalMap(signalMap);
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		int k = 0;
		while (flag) {
			String newCont = contSVG.substring(k);
			int ind = newCont.indexOf("transform=\"t");
			
			if (ind < 0 ) {
				flag = false;
				result.setContent(contSVG);
				return result;
			} else {
				lastInd = newCont.substring(ind + 12).indexOf("\"") + 12;
				String transform = newCont.substring(ind, lastInd + ind);
				contSVG = contSVG.replace(transform, "transform=\"" + getMatrix(transform).trim());
				k = lastInd + ind + k;
			}
		}
		return null;
	}
	
	private static String getMatrix(String transform) {
		transform = transform.substring(transform.indexOf("\"") + 1).toLowerCase();
		String[] sp = transform.split(" ");
		List<String> matrixs = new ArrayList<>();
		for (int i = 0; i < sp.length; i++) {
			String key = sp[i].substring(0, sp[i].indexOf("("));
			switch (key) {
			case "translate":
				matrixs.add(String.format("matrix(1, 0, 0, 1, %s)", 
						sp[i].substring(sp[i].indexOf("(") + 1, sp[i].length() - 1)));
				break;
			case "scale":
				String[] koefs = sp[i].substring(sp[i].indexOf("(") + 1, sp[i].length() - 1).split(",");
				if (koefs.length > 1) {
					matrixs.add(String.format("matrix(%s, 0, 0, %s, 0, 0)", koefs[0], koefs[1]));
				} else {
					matrixs.add(String.format("matrix(%s, 0, 0, %s, 0, 0)", koefs[0], koefs[0]));
				}
				break;
			case "rotate":
				String deg = sp[i].substring(sp[i].indexOf("(") + 1, sp[i].length() - 1);
				double cosX = Math.cos(Math.toRadians(Double.valueOf(deg)));
				double sinX = Math.sin(Math.toRadians(Double.valueOf(deg)));
				matrixs.add(String.format("matrix(%s, %s, %s, %s, 0, 0)", Math.abs(cosX) < 1E-7 ? 0 : cosX,
						Math.abs(sinX) < 1E-7 ? 0 : sinX, 
						Math.abs(sinX) < 1E-7 ? 0 : -sinX, Math.abs(cosX) < 1E-7 ? 0 : cosX));
				break;
			default:
				System.err.println(" === " + sp[i] + "\n");
				break;
			}
		}
		String result = "";
		for (int i = 1; i < matrixs.size(); i++) {
			if (i == 1) {
				result = getMatrix(matrixs.get(i - 1), matrixs.get(i));
			} else {
				result = getMatrix(result, matrixs.get(i));
			}
		}
		if (matrixs.size() == 1) result = matrixs.get(0);
		return result;
	}
	
	private static String getMatrix(String s1, String s2) {
		String sep;
		if (s1.indexOf(",")==-1) sep = " "; else sep = ",";
		
		s1 = s1.substring(7, s1.length() - 1);
		String[] arr1 = s1.split(sep);
		s2 = s2.substring(7, s2.length() - 1);
		if (s2.indexOf(",")==-1) sep = " "; else sep = ",";
		String[] arr2 = s2.split(sep);

		return "matrix(" + 
			(Double.valueOf(arr1[0]) * Double.valueOf(arr2[0]) + Double.valueOf(arr1[2]) * Double.valueOf(arr2[1])) + sep +
		    (Double.valueOf(arr1[1]) * Double.valueOf(arr2[0]) + Double.valueOf(arr1[3]) * Double.valueOf(arr2[1])) + sep +
		    (Double.valueOf(arr1[0]) * Double.valueOf(arr2[2]) + Double.valueOf(arr1[2]) * Double.valueOf(arr2[3])) + sep +
		    (Double.valueOf(arr1[1]) * Double.valueOf(arr2[2]) + Double.valueOf(arr1[3]) * Double.valueOf(arr2[3])) + sep +
		    (Double.valueOf(arr1[0]) * Double.valueOf(arr2[4]) + Double.valueOf(arr1[2]) * Double.valueOf(arr2[5]) + Double.valueOf(arr1[4])) + sep +
		    (Double.valueOf(arr1[1]) * Double.valueOf(arr2[4]) + Double.valueOf(arr1[3]) * Double.valueOf(arr2[5]) + Double.valueOf(arr1[5])) + ")";
	}
	
	private static void clean(SVG svg, G g, Map<String, Map<String, String>> custProps, Map<Integer, List<String>> signalMap) {
		if (g.getTitle().toLowerCase().contains("lineconn.") || g.getTitle().toLowerCase().contains("line.")) {
			try {
				String classes = getInnerClasses(g);
				if (g.getTitle().toLowerCase().contains("lineconn.")) {
					G lg = g;
					while (lg.getListG() != null) {
						lg = lg.getListG().get(1);
					}
					
					lg.getlPath().remove(0);
					g.getListG().get(0).setlPath(lg.getlPath());
				} else {
					g.setClazz(classes);
				}
				g.getListG().remove(1);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		
		if (g.getCustProps() != null) {
			Map<String, String> gData = new HashMap<>();
			g.getCustProps().getCustomProps().forEach(p -> {
				String nameCP = p.getNameU();
				gData.put(nameCP, p.getVal());
				if (nameCP.toLowerCase().equals("id") || nameCP.toLowerCase().equals("idts111")) {
					if (p.getVal() != null) {
						Integer idSignal = Integer.parseInt(p.getVal());
						if (signalMap.containsKey(idSignal)) {
							signalMap.get(idSignal).add(g.getId());
						} else {
							List<String> groups = new ArrayList<>();
							groups.add(g.getId());
							signalMap.put(idSignal, groups);
						}
					}
				}
			});
			
			gData.put("title", g.getTitle());
			custProps.put(g.getId(), gData);
		}
		
		if (g.getlText() != null) {
			try {
				Vparagraph paragraph = g.getlText().get(0).getvParagraph();
				if (paragraph != null) {
					int align = paragraph.getHorizAlign() == null ? 0 : paragraph.getHorizAlign();
					String aligment = "left";
					switch (align) {
					case 0:
						aligment = "left";
						break;
					case 1:
						aligment = "center";
						break;
					case 2:
						aligment = "right";
						break;
					}
					
					g.setStyle("text-align: " + aligment + ";");
				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		
		g.setCustProps(null);
		g.setUserDefs(null);
		g.setDesc(null);
		g.setPageProperties(null);
		g.setGroupContext(null);
		g.setmID(null);
		g.setDesc(null);
		g.setTitle(null);
		g.setIndex(null);
		g.setLayer(null);
		g.setLayerMember(null);
		g.setTextBlock(null);
		g.setTextRect(null);
		
		if (g.getlText() != null) g.getlText().forEach(t -> {
			t.setvParagraph(null);
			t.setLangID(null);
			t.getMixedValue().removeIf(v -> v.toString().indexOf("v:") != -1);
		});
		
		if (g.getListG() != null) g.getListG().forEach(gr -> clean(svg, gr, custProps, signalMap));
	}
	
	private static String getInnerClasses(G g) {
		String result = g.getClazz() != null ? g.getClazz() : "";
		if (g.getListG() != null && g.getListG().size() > 1) {
			G fg = g.getListG().get(0);
			G sg = g.getListG().get(1);
			if (fg.getlPath() != null && fg.getlPath().size() > 0) {
				result += " " + fg.getlPath().get(0).getClazz();
			}
			
			if (sg.getListG() != null && sg.getListG().size() > 0) {
				result += " " + getInnerClasses(g.getListG().get(1));
			}
		}
		
		return result.trim();
	}
}
