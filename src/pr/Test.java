package pr;

import pr.svgObjects.G;
import pr.svgObjects.SVG;

public class Test {

	public static void main(String[] args) {
		String filePath = "d:/GIT/PowerSysWeb/PowerSysWeb/WebContent/schemes/11";
		SVGModel svgModel = SVGModel.getInstance();
		SVG svg = svgModel.getSVG(filePath + ".svg");
		svg.setTitle(null);
//		svg.setDefs(null);
		svg.setDocumentProperties(null);
		
		svg.getG().forEach(g -> clean(g));
//		svgModel.setObject(filePath + "_2.svg", svg);
//		System.out.println(filePath + "_2.svg");
		System.out.println(svgModel.setObject(svg));
	}
	
	private static void clean(G g) {
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
		
		if (g.getListG() != null) g.getListG().forEach(gr -> clean(gr));
	}
}
