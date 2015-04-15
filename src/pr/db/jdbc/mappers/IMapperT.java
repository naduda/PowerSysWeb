package pr.db.jdbc.mappers;

import java.sql.Timestamp;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.MapKey;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import pr.model.ConfTree;
import pr.model.TViewParam;
import pr.model.Tconftree;
import pr.model.Transparant;
import pr.model.Tscheme;
import pr.model.Tsignal;
import pr.model.TtranspHistory;
import pr.model.TtranspLocate;
import pr.model.Ttransparant;
import pr.model.Tuser;
import pr.model.TSysParam;

public interface IMapperT {
	@Select("select * from t_conftree")
	@MapKey("idnode")
	Map<Integer, Tconftree> getTconftreeMap();
	
	@Select("select * from t_scheme")
	@MapKey("idscheme")
	Map<Integer, Tscheme> getSchemesMap();
	
	@Select("select * from t_signal")
	@MapKey("idsignal")
	Map<Integer, Tsignal> getTsignalsMap();
	
	@Select("select * from t_user")
	@MapKey("iduser")
	Map<Integer, Tuser> getTuserMap();
	
	@Select("select * from t_conftree")
	@MapKey("idnode")
	Map<Integer, ConfTree> getConfTreeMap();
	
	@Select("select * from t_sysparam")
	List<TSysParam> getTSysParam();
	
	@Select("select * from t_viewparam")
	List<TViewParam> getTViewParam();
	
	@Select("select img from t_transp_type where idtr = #{idtr}")
	Object getTransparantById(@Param("idtr")int idTransparant);
	
	@Select("select * from t_transp_type")
	@MapKey("idtr")
	Map<Integer, Transparant> getTransparants();
	
	@Select("select * from t_transparant where schemeref = #{schemeref} and closetime is null")
	List<Ttransparant> getTtransparantsActive(@Param("schemeref")int idScheme);
	
	@Select("select * from t_transparant where settime > #{settime} and closetime is null")
	List<Ttransparant> getTtransparantsNew(@Param("settime")Timestamp settime);
	
	@Select("select * from t_transp_locate where trref = #{trref}")
	TtranspLocate getTransparantLocate(@Param("trref")int trref);
	
	@Select("select * from t_transparant where closetime > #{closetime}")
	List<Ttransparant> getTtransparantsClosed(@Param("closetime")Timestamp closetime);
	
	@Select("select * from t_transparant where lastupdate > #{lastupdate} and settime != lastupdate and closetime is null")
	List<Ttransparant> getTtransparantsUpdated(@Param("lastupdate")Timestamp lastupdate);
	
	@Select("select max(idtr) + 1 from t_transparant")
	int getMaxTranspID();
	
	@Select("update t_transparant set closetime = now() where idtr = #{idtr}")
	void updateTtransparantCloseTime(@Param("idtr")int idtr);
	
	@Select("select * from t_transp_history where trref = #{trref}")
	TtranspHistory getTtranspHistory(@Param("trref")int trref);
	
	@Select("select * from t_transparant where idtr = #{idtr}")
	Ttransparant getTtransparantById(@Param("idtr")int idtr);
}
