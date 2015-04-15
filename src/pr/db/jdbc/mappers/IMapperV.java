package pr.db.jdbc.mappers;

import java.util.Map;

import org.apache.ibatis.annotations.MapKey;
import org.apache.ibatis.annotations.Select;

import pr.model.VsignalView;

public interface IMapperV {
	@Select("select * from v_signal_view")
	@MapKey("idsignal")
	Map<Integer, VsignalView> getVsignalViewMap();
}
