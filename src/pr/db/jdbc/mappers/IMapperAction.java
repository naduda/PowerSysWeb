package pr.db.jdbc.mappers;

import java.sql.Timestamp;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

public interface IMapperAction {
	@Update("update t_scheme set schemedenom = #{schemedenom}, schemename = #{schemename}, schemedescr = #{schemedescr}, "
			+ "parentref = #{parentref}, schemefile = #{schemefile}, userid = #{userid} "
			+ "where idscheme = #{idscheme}")
	void updateTScheme(@Param("idscheme")int idscheme, @Param("schemedenom")String schemedenom, 
			@Param("schemename")String schemename, @Param("schemedescr")String schemedescr, 
			@Param("parentref") int parentref, @Param("schemefile")Object schemefile, @Param("userid")int userid);
	
	@Delete("delete from t_scheme where idscheme = #{idscheme}")
	void deleteScheme(@Param("idscheme")int idscheme);
	
	@Insert("insert into t_scheme " +
			"(idscheme, schemedenom, schemename, schemedescr, parentref, schemefile, userid, lastupdatedt, savehistory) " + 
			"values ((select max(idscheme) + 1 from t_scheme), #{schemedenom}, #{schemename}, #{schemedescr}, " + 
			"#{parentref}, #{schemefile}, #{userid}, now(), 0)")
	void addScheme(@Param("schemedenom")String schemedenom, @Param("schemename")String schemename, 
			@Param("schemedescr")String schemedescr, @Param("parentref") int parentref, 
			@Param("schemefile")Object schemefile, @Param("userid")int userid);
	
	@Update("update d_eventlog set logstate = 2, confirmdt = #{confirmdt}, lognote = #{lognote}, userref = #{userref} " + 
			"where recorddt = #{recorddt} and  eventdt = #{eventdt} and objref = #{objref};" +
			"delete from t_sysparam where paramname = 'LAST_USR_ACK';" +
			"insert into t_sysparam values ( 3, 'LAST_USR_ACK', extract(epoch FROM now()), 'Время последнего квитирования');")
	void confirmAlarm(@Param("recorddt")Timestamp recorddt, @Param("eventdt")Timestamp eventdt, 
					  @Param("objref")int objref, @Param("confirmdt")Timestamp confirmdt, 
					  @Param("lognote")String lognote, @Param("userref")int userref);
	
	@Update("update d_eventlog set logstate = 2, confirmdt = now(), lognote = #{lognote}, userref = #{userref} " +
			"where logstate = 1;" + 
			"delete from t_sysparam where paramname = 'LAST_USR_ACK';" + 
			"insert into t_sysparam values ( 3, 'LAST_USR_ACK', extract(epoch FROM now()), 'Время последнего квитирования');")
	void confirmAlarmAll(@Param("lognote")String lognote, @Param("userref")int userref);
	
	@Insert("insert into d_eventlog (eventtype, objref, eventdt, objval, objstatus, authorref) values "
			+ "(#{eventtype}, #{objref}, #{eventdt}, #{objval}, #{objstatus}, #{authorref})")
	void insertDeventLog(@Param("eventtype")int eventtype, @Param("objref")int objref, @Param("eventdt")Timestamp eventdt, 
			@Param("objval")double objval, @Param("objstatus")int objstatus, @Param("authorref")int authorref);
	
	@Insert("insert into t_transparant(idtr, signRef, objName, tp, SchemeRef, settime, lastupdate) "
		+ "values (#{idtr}, #{signref}, #{objname}, #{tp}, #{schemeref}, now(), now())")
	void insertTtransparant(@Param("idtr")int idtr, @Param("signref")int signref, @Param("objname")String objname, 
		@Param("tp")int tp, @Param("schemeref")int schemeref);
	
	@Insert("insert into t_transp_history(trRef, infoType, tm, userRef, txt, trtype) "
		+ "values (#{trref}, 0, now(), #{userref}, #{txt}, #{trtype})")
	void insertTtranspHistory(@Param("trref")int trref, @Param("userref")int userref, 
		@Param("txt")String txt, @Param("trtype")int trtype);
	
	@Delete("delete from t_transp_locate where trRef=#{trref} and scRef=#{scref}")
	void deleteTtranspLocate(@Param("trref")int trref, @Param("scref")int scref);
	
	@Insert("insert into t_transp_locate values (#{trref}, #{scref}, #{x}, #{y}, #{h}, #{w})")
	void insertTtranspLocate(@Param("trref")int trref, @Param("scref")int scref, 
		@Param("x")int x, @Param("y")int y, @Param("h")int h, @Param("w")int w);
	
	@Update("update t_transp_locate set scref = #{scref}, "
		+ "x = #{x}, y = #{y}, h = #{h}, w = #{w} where trref = #{trref}")
	void updateTtranspLocate(@Param("trref")int trref, @Param("scref")int scref, 
		@Param("x")int x, @Param("y")int y, @Param("h")int h, @Param("w")int w);
	
	@Update("update t_transparant set lastupdate = now() where idtr = #{idtr}")
	void updateTtransparantLastUpdate(@Param("idtr")int idtr);
	
	@Update("update t_transp_history set txt=#{txt} where trref = #{trref}")
	void updateTtranspHistory(@Param("trref")int trref, @Param("txt")String txt);
	
	@Delete("delete from t_sysparam where paramname = 'LAST_USR_ACK';")
	void deleteLastUserAck();
	
	@Insert("insert into t_sysparam values ( 3, 'LAST_USR_ACK', extract(epoch FROM now()), 'Время последнего квитирования');")
	void insertLastUserAck();
	
	@Update("update t_signal set baseval = #{val} where idSignal = #{idSignal}")
	void setBaseVal(@Param("idSignal")int idSignal, @Param("val")double val);
	
	@Update("update t_signal set status = #{status} where idsignal = #{idsignal}")
	void updateTsignalStatus(@Param("idsignal")int idSignal, @Param("status")int status);
}
