package pr.db;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.stream.Collectors;

import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;

import pr.db.jdbc.BatisJDBC;
import pr.db.jdbc.PostgresDB;
import pr.db.jdbc.mappers.IMapper;
import pr.db.jdbc.mappers.IMapperAction;
import pr.db.jdbc.mappers.IMapperSP;
import pr.db.jdbc.mappers.IMapperT;
import pr.db.jdbc.mappers.IMapperV;
import pr.model.Alarm;
import pr.model.DvalTI;
import pr.model.LinkedValue;
import pr.model.SpTypeSignal;
import pr.model.TSysParam;
import pr.model.TViewParam;
import pr.model.Tscheme;
import pr.model.Tsignal;
import pr.model.Tuser;
import pr.model.VsignalView;
import pr.server.topic.MainTopic;

@SuppressWarnings("unchecked")
public class ConnectDB {
	private static DataSource dsLocal = null;
	private static Context context = null;
	
	public static DataSource getDataSource() {
		if (dsLocal != null) return dsLocal;
		try {
			if (context == null) {
				context = new InitialContext();
			}
			dsLocal = (DataSource) context.lookup("localDS");
		} catch (Exception e) {
			System.out.println(e.getMessage());
		}
		return dsLocal;
	}
	
	public static String getChildNodes(String id) {
		if (id.equals("#") || id.length() == 0) id = "0";
		final int intId = Integer.parseInt(id);
		
		JsonArrayBuilder json = Json.createArrayBuilder();
		Map<Integer, Tscheme> nodesMap = (Map<Integer, Tscheme>) 
				new BatisJDBC(s -> s.getMapper(IMapperT.class).getSchemesMap()).get();
		nodesMap.values().stream().filter(f -> f.getParentref() == intId)
			.forEach(n -> {
				JsonObjectBuilder ch = Json.createObjectBuilder();
				ch.add("id", n.getIdscheme())
				.add("text", n.getSchemename())
				.add("dt", "dt_Test")
				.add("children", nodesMap.values().stream()
						.filter(f -> f.getParentref() == n.getIdscheme()).count() > 0);
				json.add(ch);
			});
		
		return json.build().toString();
	}
	
	public static List<DvalTI> getOldValues(Set<Integer> signalsSet) {
		List<DvalTI> resultMap = new ArrayList<>();
		final StringBuilder idBuilder = new StringBuilder();
		idBuilder.append("{");
		signalsSet.forEach(s -> idBuilder.append(s + ","));
		idBuilder.delete(idBuilder.length() - 1, idBuilder.length());
		idBuilder.append("}");
		
		String idSignals = idBuilder.toString();
		if(idSignals.length() < 3) return null;
		
		final ExecutorService service = Executors.newFixedThreadPool(2);
		List<Future<List<DvalTI>>> futures = new ArrayList<>(2);
		
		futures.add(service.submit(() ->
			(List<DvalTI>) new BatisJDBC(s -> s.getMapper(IMapper.class).getOldTI(idSignals)).get()));
		futures.add(service.submit(() ->
			(List<DvalTI>) new BatisJDBC(s -> s.getMapper(IMapper.class).getOldTS(idSignals)).get()));
		
		futures.forEach(f -> {
			try {
				resultMap.addAll(f.get());
			} catch (Exception e) {
				System.out.println(e.getMessage() + "     ; f = " + f);
			}
		});
		return resultMap;
	}
	
	public static Map<Integer, VsignalView> getVsignalsMap() {
		return (Map<Integer, VsignalView>) 
				new BatisJDBC(s -> s.getMapper(IMapperV.class).getVsignalViewMap()).get();
	}
	
	public static Map<Integer, Tsignal> getTsignalsMap() {
		return (Map<Integer, Tsignal>) 
				new BatisJDBC(s -> s.getMapper(IMapperT.class).getTsignalsMap()).get();
	}
	
	public static Map<String, TSysParam> getTSysParam(String paramname) {
		Map<String, TSysParam> ret = new HashMap<>();
		((List<TSysParam>)new BatisJDBC(s -> s.getMapper(IMapperT.class).getTSysParam()).get())
			.stream().filter(it -> it.getParamname().equals(paramname))
			.forEach(it -> ret.put(it.getVal(), it));
		return ret;
	}
	
	public static List<TViewParam> getTViewParam(String objdenom, String paramdenom, int userref) {
		return ((List<TViewParam>)new BatisJDBC(s -> s.getMapper(IMapperT.class).getTViewParam()).get())
			.stream().filter(it -> it.getObjdenom().equals(objdenom))
			.filter(it -> it.getParamdenom().equals(paramdenom))
			.filter(it -> it.getUserref() == userref).collect(Collectors.toList());
	}
	
	public static Map<Integer, SpTypeSignal> getSpTypeSignalMap() {
		return (Map<Integer, SpTypeSignal>) new BatisJDBC(s -> 
			s.getMapper(IMapperSP.class).getSpTypeSignalMap()).get();
	}
	
	public static List<Alarm> getCurDayAlarms() {
		SimpleDateFormat formatter = new SimpleDateFormat("dd.MM.yyyy");
		try {
//			Timestamp dt = new Timestamp(formatter.parse(formatter.format(new Date())).getTime());
			Timestamp dt = new Timestamp(formatter.parse("01.01.2015").getTime());
			return (List<Alarm>) new BatisJDBC(s -> s.getMapper(IMapper.class).getAlarms(dt)).get();
		} catch (Exception e) {
			e.printStackTrace();
		}
		return null;
	}
	
	public static Map<Integer, Tuser> getTuserMap() {
		return (Map<Integer, Tuser>) new BatisJDBC(s -> s.getMapper(IMapperT.class).getTuserMap()).get();
	}
	
	public static List<LinkedValue> getDataIntegrArc(int idSignal, Timestamp dtBeg, Timestamp dtEnd, int period) {
		return (List<LinkedValue>) new BatisJDBC(s -> s.getMapper(IMapper.class).getDataIntegrArc(idSignal, dtBeg, dtEnd, period)).get();
	}
	
	public static void setTU(int idsignal, double val, int rCode, int userId, int schemeref) {
		new BatisJDBC(s -> s.getMapper(IMapper.class).setTU(idsignal, val, rCode, userId, schemeref)).get();
	}
	
	public static void confirmAlarm(Timestamp recordDT, Timestamp eventDT, int objref, 
			Timestamp confirmDT, String comment, int userref) {		
		new BatisJDBC(s -> {
			s.getMapper(IMapperAction.class).confirmAlarm(recordDT, eventDT, objref, confirmDT, comment, userref);
			return 0;
		}).get();
	}
	
	public static void confirmAlarmAll(String lognote, int userref) {
		new BatisJDBC(s -> {s.getMapper(IMapperAction.class).confirmAlarmAll(lognote, userref);return 0;}).get();
	}
	
	private static PostgresDB postgressDB;
	public static PostgresDB getPostgressDB() {
		if (postgressDB == null) {
			postgressDB = new PostgresDB("localDS");
			MainTopic mTopic = new MainTopic();
			mTopic.start();
			System.out.println("New connection");
		}
		return postgressDB;
	}
	
	public static void setPostgressDB(PostgresDB value) {
		postgressDB = value;
	}
}
