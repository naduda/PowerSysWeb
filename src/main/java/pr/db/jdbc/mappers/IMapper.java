package pr.db.jdbc.mappers;

import java.sql.Timestamp;
import java.util.List;

import pr.model.Alarm;
import pr.model.ControlJournalItem;
import pr.model.DvalTI;
import pr.model.DvalTS;
import pr.model.LinkedValue;
import pr.model.NormalModeJournalItem;
import pr.model.SwitchEquipmentJournalItem;
import pr.model.TalarmParam;
import pr.model.UserEventJournalItem;

import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

public interface IMapper {
//	==============================================================================
	void update(String query);
//	==============================================================================
	
	@Select("select * from d_valti where servdt > #{servdt} order by servdt desc")
	List<DvalTI> getLastTI(Timestamp servdt);
	
	@Select("select (getlast_ti(idsignal, null, 0)).* from t_signal where typesignalref = 1 and idsignal = ANY(#{idsignals}::int[])")
	@Results(value = {
			@Result(property="signalref", column="id"),
			@Result(property="val", column="val"),
			@Result(property="dt", column="dt"),
			@Result(property="rcode", column="rcode"),
			@Result(property="servdt", column="servdt")
	})
	List<DvalTI> getOldTI(@Param("idsignals") String idSignals);

	@Select("select * from d_valts where servdt > #{servdt} order by servdt desc")
	List<DvalTS> getLastTS(Timestamp servdt);
	
	@Select("select (getlast_ts(idsignal, null, 0)).* from t_signal where typesignalref = 2 and idsignal = ANY(#{idsignals}::int[])")
	@Results(value = {
			@Result(property="signalref", column="id"),
			@Result(property="val", column="val"),
			@Result(property="dt", column="dt"),
			@Result(property="rcode", column="rcode"),
			@Result(property="servdt", column="servdt")
	})
	List<DvalTS> getOldTS(@Param("idsignals") String idSignals);
	
	@Select("select (getlast_ti(idsignal, #{dtValue}, 1)).* from t_signal where idsignal = ANY(#{idsignals}::int[]) union all "
			+ "select (getlast_ts(idsignal, #{dtValue}, 1)).* from t_signal where idsignal = ANY(#{idsignals}::int[])")
	@Results(value = {
			@Result(property="signalref", column="id"),
			@Result(property="val", column="val"),
			@Result(property="dt", column="dt"),
			@Result(property="rcode", column="rcode"),
			@Result(property="servdt", column="servdt")
	})
	List<DvalTI> getValuesOnDate(@Param("idsignals") String idSignals, @Param("dtValue") Timestamp dtValue);
	
	@Select("select set_ts(#{idsignal}, #{val}, now()::timestamp without time zone, #{rCode}, #{userId}, #{schemeref})")
	Integer setTS(@Param("idsignal") int idsignal, @Param("val") double val, @Param("rCode") int rCode,
			@Param("userId") int userId, @Param("schemeref") int schemeref);
	
	@Select("select Set_TU(#{idsignal}, #{val}, null, #{rCode}, #{userId}, #{schemeref})")
	Integer setTU(@Param("idsignal") int idsignal, @Param("val") double val, @Param("rCode") int rCode,
			@Param("userId") int userId, @Param("schemeref") int schemeref);
	
	@Select("select sendok from d_valtu where signalref = #{idsignal} order by dt desc limit 1")
	Integer getSendOK(@Param("idsignal") int idsignal);
	
	@Update("update t_device set state = #{state}, laststate = now() where iddevice = ANY(#{iddevices}::int[])")
	void setDevicesState(@Param("iddevices")String iddevices, @Param("state")int state);
	
	@Select("select iddevice, namedevice, state from t_device where iddevice = ANY(#{iddevices}::int[]) order by state")
	@Results(value = {
			@Result(property="id", column="iddevice"),
			@Result(property="val", column="state"),
			@Result(property="dt", column="namedevice")
	})
	List<LinkedValue> getDevicesState(@Param("iddevices") String iddevices);
	
	@Select("select distinct deviceref from t_devicesignal where signalref = ANY(#{idsignals}::int[])")
	List<Integer> getActiveDevices(@Param("idsignals") String idSignals);
	
	@Select("select * from "
			+ "(select *, alarms_for_event(eventtype,objref,objStatus) as alarms "
			+ "from d_eventlog) as eloginner join t_alarm on alarmid in (alarms) "
			+ "where recorddt > #{recorddt} order by recorddt desc")
	List<Alarm> getAlarms(Timestamp recorddt);
	
	@Select("select * from "
			+ "(select *, alarms_for_event(eventtype,objref,objStatus) as alarms "
			+ "from d_eventlog) as eloginner join t_alarm on alarmid in (alarms) "
			+ "where recorddt >= #{dtBeg} and recorddt <= #{dtEnd} order by recorddt desc")
	List<Alarm> getAlarmsPeriod(@Param("dtBeg")Timestamp dtBeg, @Param("dtEnd")Timestamp dtEnd);
	
	@Select("select * from "
			+ "(select *, alarms_for_event(eventtype,objref,objStatus) as alarms "
			+ "from d_eventlog) as eloginner join t_alarm on alarmid in (alarms) "
			+ "where recorddt >= #{dtBeg} and recorddt <= #{dtEnd} and objref = #{idSignal} order by recorddt desc")
	List<Alarm> getAlarmsPeriodById(@Param("dtBeg")Timestamp dtBeg, @Param("dtEnd")Timestamp dtEnd, @Param("idSignal")int idSignal);
	
	@Select("select * from "
			+ "(select *, alarms_for_event(eventtype,objref,objStatus) as alarms "
			+ "from d_eventlog) as eloginner join t_alarm on alarmid in (alarms) "
			+ "where confirmdt > #{confirmdt} order by confirmdt desc")
	List<Alarm> getAlarmsConfirm(Timestamp confirmdt);
	
	@Select("select distinct objref from "
			+ "(select *, alarms_for_event(eventtype,objref,objStatus) as alarms "
			+ "from d_eventlog) as eloginner join t_alarm on alarmid in (alarms) "
			+ "where objref = ANY(#{idsignals}::int[]) and confirmdt is null and logstate != 2 "
			+ "order by objref desc")
	List<Integer> getNotConfirmedSignals(@Param("idsignals") String idSignals);
	
	@Select("select * from "
			+ "(select *, alarms_for_event(eventtype,objref,objStatus) as alarms "
			+ "from d_eventlog) as eloginner join t_alarm on alarmid in (alarms) "
			+ "where confirmdt is null order by alarmpriority, eventdt desc limit 1")
	Alarm getHightPriorityAlarm();
	
	@Select("select * from t_alarmparam where alarmref = #{alarmref}")
	List<TalarmParam> getTalarmParams(@Param("alarmref")int alarmref);
	
	@Select("select dt, val, signalref from d_valti where signalref = #{signalref} order by dt")
	@Results(value = {
			@Result(property="dt", column="dt"),
			@Result(property="val", column="val"),
			@Result(property="id", column="signalref")
	})
	List<LinkedValue> getData(int signalref);
	
	@Select("select dt, val, signalref from d_arcvalti where signalref = #{signalref} and dt > #{dtBeg} and dt < #{dtEnd} order by dt")
	@Results(value = {
			@Result(property="dt", column="dt"),
			@Result(property="val", column="val"),
			@Result(property="id", column="signalref")
	})
	List<LinkedValue> getDataArc(@Param("signalref")int signalref, @Param("dtBeg")Timestamp dtBeg, @Param("dtEnd")Timestamp dtEnd);
	
	@Select("select dt, val, signalref from f_valti(#{id}, #{dtbeg}, #{dtend}, #{inter}) order by dt")
	@Results(value = {
			@Result(property="dt", column="dt"),
			@Result(property="val", column="val"),
			@Result(property="id", column="signalref")
	})
	List<LinkedValue> getDataIntegr(@Param("id") int idSignal, @Param("dtbeg") Timestamp dtBeg, 
			@Param("dtend") Timestamp dtEnd, @Param("inter") int period);
	
	@Select("select dt, val, signalref from f_arcvalti(#{id}, #{dtbeg}, #{dtend}, #{inter}) order by dt")
	@Results(value = {
			@Result(property="dt", column="dt"),
			@Result(property="val", column="val"),
			@Result(property="id", column="signalref")
	})
	List<LinkedValue> getDataIntegrArc(@Param("id") int idSignal, @Param("dtbeg") Timestamp dtBeg, 
			@Param("dtend") Timestamp dtEnd, @Param("inter") int period);
	
	@Select("select dt, schemeName, nameSignal, formatValue(idsignal, d.val) as val, paramdescr as status, "
			+ "statedt-servdt as duration, fio from (select * from d_arcvaltu tu union all "
			+ "(select dt, signalref, val, 3 as sendok, servdt, rcode, userref, statedt, "
			+ "ts.schemeRef from d_arcvalts ts where rcode = 107 )) as d left join t_signal s "
			+ "on signalref=idsignal left join t_scheme sc on d.schemeref=idscheme left join "
			+ "(select -1 as idUser, 'Admin' as fio union select iduser, fio from t_user) u on "
			+ "userRef=idUser left join t_sysparam v on v.val=d.sendOK and paramname='SENDTU_STATUS' "
			+ "where dt >= #{dtBeg} and dt <= #{dtEnd} order by dt")
	List<ControlJournalItem> getJContrlItems(@Param("dtBeg")Timestamp dtBeg, @Param("dtEnd")Timestamp dtEnd);
	
	@Select("select eventdt, v2.paramdescr as app, fio, v1.paramdescr as descr "
			+ "from d_eventlog d join t_sysparam v1 on v1.val = d.eventtype and v1.paramname = 'EVENT_TYPE' "
			+ "left join (select -1 as idUser, null as fio union select iduser, fio from t_user) u on authorRef = idUser "
			+ "left join t_sysparam v2 on v2.val = d.objref and v2.paramname = 'APPLIST' "
			+ "where eventdt >= #{dtBeg} and eventdt<#{dtEnd} order by eventdt")
	List<UserEventJournalItem> getUserEventJournalItems(@Param("dtBeg")Timestamp dtBeg, @Param("dtEnd")Timestamp dtEnd);
	
	@Select("select path, nameSignal, idsignal, val, dt, (select min(dt) from d_arcvalts "
			+ "where signalref = idsignal and dt > d.dt and val <> d.val) dt_new "
			+ "from (select idSignal, signalpath(idSignal) as path, nameSignal, "
			+ "coalesce(getval_ts(idSignal, #{dtBeg}::timestamp with time zone), baseval) as val, "
			+ "getdt_ts(idSignal, #{dtBeg}::timestamp with time zone) as dt, baseval from t_signal s "
			+ "where idsignal = ANY(#{idsignals}::int[]) union all select idSignal, signalpath(idSignal) as path, nameSignal, val, dt, baseval "
			+ "from d_arcvalts join t_signal on signalref = idsignal "
			+ "where idsignal = ANY(#{idsignals}::int[]) and dt > #{dtBeg} and dt < #{dtEnd}) d where val <> baseval order by dt desc")
	List<NormalModeJournalItem> getListNormalModeItems(@Param("dtBeg")Timestamp dtBeg, @Param("dtEnd")Timestamp dtEnd, 
			@Param("idsignals") String idSignals);
	
	@Select("select formatvalue(id,val) as txtval , * "
			+ "from (select t.namesignal, (getlast_ts(t.idsignal, null, 0)).* "
			+ "from t_signal t where t.typesignalref = 2 and t.idsignal = ANY(#{idsignals}::int[])) as t "
			+ "order by t.namesignal")
	List<SwitchEquipmentJournalItem> getSwitchJournalItems(@Param("idsignals") String idSignals);
}