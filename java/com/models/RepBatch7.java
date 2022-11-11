package com.models;

import java.io.Reader;
import java.io.StringReader;
import java.sql.Connection;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.controller.InstanceInfo;
import com.controller.UserRoute;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.generic.QueryExe;
import com.generic.utils;

public class RepBatch7 {
	@Component
	public class Qrys {
		public String sql = "";
		public String data = "";
		public String status = UserReports.STATUS_NONE;
		public Map<String, String> params = new HashMap<String, String>();

	};

	@Component
	public class UserReports extends Thread {
		public static final String STATUS_NONE = "NONE";
		public static final String STATUS_START = "START";
		public static final String STATUS_ERROR = "ERROR";
		public static final String STATUS_END = "END";
		public static final String STATUS_CANCELLED = "CANCELLED";

		public InstanceInfo instanceInfo = null;
		public UserRoute userroute = null;
		public String status = UserReports.STATUS_NONE;
		public Map<Integer, Qrys> qrysMetaData = new HashMap<Integer, Qrys>();
		public Map<String, String> params = new HashMap<String, String>();
		public String error_message = "";
		public String report_code = "";
		public int repno = -1;
		public Date exetime = null;
		public String cmd = "";
		public String whereClause = "";
		public String reportTitle = "";
		public boolean notified = false;
		public double notification_kfld = -1;

		public String getReturnString(String qryCode) {
			return this.qrysMetaData.get(qryCode).data;
		}

		public UserReports(String prep_code, InstanceInfo i, Map<String, String> pms) {
			this.report_code = prep_code;
			this.params.clear();
			this.params.putAll(pms);
			this.instanceInfo = i;
		}

		@Override
		public void run() {
			System.out.println("Running thread ..." + this.report_code + ", repno=" + this.repno);
			try {
				if (!instanceInfo.isMlogonSuccessed())
					throw new SQLException("Access denied !");
				for (int strq : this.qrysMetaData.keySet()) {
					this.status = UserReports.STATUS_START;
					this.exetime = new Date(System.currentTimeMillis());
					Qrys qry = this.qrysMetaData.get(strq);
					qry.status = qry.status = UserReports.STATUS_START;
					qry.data = this.executeSQlMetaData(qry.sql, qry.params);
					qry.status = UserReports.STATUS_END;
				}
				this.status = UserReports.STATUS_END;
				if (!this.notified)
					this.notification_kfld = utils.insertNotify(this.instanceInfo.getmDbc().getDbConnection(),
							this.instanceInfo.getmLoginUser(), "END_OF_REPORT",
							this.reportTitle + "  ended successfully ", this.cmd);
				this.notified = true;

				System.out.println("Fetched : , status :" + this.status);
			} catch (Exception e) {
				e.printStackTrace();
				this.status = "ERROR";
				RepBatch7.this.clearReport(instanceInfo, this.report_code, this.repno);
			}

		}

		private String executeSQlMetaData(String sql, Map<String, String> params) throws Exception {
			SimpleDateFormat sdf = new SimpleDateFormat(instanceInfo.getMmapVar().get("ENGLISH_DATE_FORMAT") + "");
			Connection con = instanceInfo.getmDbc().getDbConnection();
			String bgn = " c6_session.username:='" + instanceInfo.getmLoginUser() + "'; c6_session.session_id:='"
					+ instanceInfo.sessionId + "';";

			String ssql = sql;
			if (!sql.toUpperCase().startsWith("SELECT")) {
				ssql = utils.insertStringAfter(sql, bgn, "BEGIN");
			}

			QueryExe qe = new QueryExe(ssql, con);
			for (String key : params.keySet()) {
				String p = params.get(key);
				String k = key.replaceAll(" ", "_").replaceAll("_para_", "");
				if (k != null && !k.isEmpty()) {
					qe.setParaValue(k, p);
					if (p.startsWith("@"))
						qe.setParaValue(k, (sdf.parse(p.substring(1))));
				}
			}
			ResultSet rs = null;
			String ret = "";

			if (ssql.toUpperCase().startsWith("SELECT")) {
				rs = qe.executeRS();
				ret = utils.getJSONsqlMetaData(rs, con, "", "");
			} else {
				qe.execute();
			}
			qe.close();
			if (rs != null) {
				if (rs.getStatement() != null)
					rs.getStatement().close();
				rs.close();
			}

			return ret;
		}

	}

	private long t = 0;
	private List<UserReports> listUserReports = new ArrayList<UserReports>();
	private Map<String, UserReports> mapUserReports = new HashMap<String, UserReports>();

	public List<UserReports> getListUserReports() {
		return listUserReports;
	}

	public Map<String, UserReports> getMapUserReports() {
		return mapUserReports;
	}

	public int addBatch(String rc, int rptno, InstanceInfo ii, Map<String, String> mps) {
		UserReports ur = null;
		String upath = ii.getmOwner() + "." + ii.getmLoginUser() + "_" + rc + "_" + rptno;
		ur = mapUserReports.get(upath);

		if (ur == null) {
			ur = new UserReports(rc, ii, mps);
			listUserReports.add(ur);
			mapUserReports.put(upath, ur);
		}

//		if (!ur.status.equals(UserReports.STATUS_START) && !ur.status.equals(UserReports.STATUS_END)) {
//			this.clearReport(ii, rc, rptno);
//			ur = new UserReports(rc, ii, mps);
//			listUserReports.add(ur);
//			mapUserReports.put(upath, ur);
//		}

//		if (startTheThread)
//			ur.start();
//		System.gc();

		return listUserReports.indexOf(ur);

	}

	public int addQry(InstanceInfo ii, String pRepCode, int pRepNo, String sqlQry, int qrNo, Map<String, String> mps) {

		String upath = ii.getmOwner() + "." + ii.getmLoginUser() + "_" + pRepCode + "_" + pRepNo;
		// if (mapUserReports.get(upath) == null)
		int rn = this.addBatch(pRepCode, pRepNo, ii, mps);

		UserReports ur = mapUserReports.get(upath);
		Qrys qr = new Qrys();
		qr.sql = sqlQry;
		qr.params.putAll(mps);
		ur.qrysMetaData.put(qrNo, qr);
		return rn;

	}

	public UserReports startThread(InstanceInfo ii, String pRepCode, int pRepNo) {
		String upath = ii.getmOwner() + "." + ii.getmLoginUser() + "_" + pRepCode + "_" + pRepNo;
		if (mapUserReports.get(upath) == null)
			return null;
		UserReports ur = mapUserReports.get(upath);
		if (ur.status.equals(UserReports.STATUS_START)) {
			System.out.println("thread already started !");
			return ur;
		}
		if (ur.status.equals(UserReports.STATUS_END)) {
			this.clearReport(ii, pRepCode, pRepNo);
			System.err.println("thread forced to start !");
			return ur;
		}
		try {
			ur.start();
		} catch (Exception ex) {
			ex.printStackTrace();
			this.clearReport(ii, pRepCode, pRepNo);
			ur.start();
		}
		System.gc();
		return ur;
	}

	public String getSqlData(InstanceInfo ii, String pRepCode, int pRepNo, int pQryNo) {
		String upath = ii.getmOwner() + "." + ii.getmLoginUser() + "_" + pRepCode + "_" + pRepNo;
		if (mapUserReports.get(upath) == null)
			return "";
		UserReports ur = mapUserReports.get(upath);
		if (ur.notification_kfld > -1)
			try {
				utils.readNotify(ii.getmDbc().getDbConnection(), ur.notification_kfld);
			} catch (SQLException e) {
				e.printStackTrace();
			}
		return ur.qrysMetaData.get(pQryNo).data;

	}

	public String getStatus(InstanceInfo ii, String pRepCode, int pRepNo) {
		String upath = ii.getmOwner() + "." + ii.getmLoginUser() + "_" + pRepCode + "_" + pRepNo;
		if (mapUserReports.get(upath) == null)
			return "";
		UserReports ur = mapUserReports.get(upath);
		return ur.status;

	}

	public String getStatus(String pUPath) {
		String upath = pUPath;
		if (mapUserReports.get(upath) == null)
			return "";
		UserReports ur = mapUserReports.get(upath);
		return ur.status;

	}

	public String getBatchParas(InstanceInfo ii, String pRepCode, int pRepNo) {
		String upath = ii.getmOwner() + "." + ii.getmLoginUser() + "_" + pRepCode + "_" + pRepNo;
		String ret = "";
		UserReports ur = null;
		if (mapUserReports.get(upath) == null)
			return "";
		ur = mapUserReports.get(upath);
		ret = utils.getJSONMapString(ur.params, false);

		return ret;
	}

	public Date getExeTime(InstanceInfo ii, String pRepCode, int pRepNo) {
		String upath = ii.getmOwner() + "." + ii.getmLoginUser() + "_" + pRepCode + "_" + pRepNo;
		Date ret;
		UserReports ur = null;
		if (mapUserReports.get(upath) == null)
			return null;
		ur = mapUserReports.get(upath);
		ret = ur.exetime;

		return ret;
	}

	public boolean saveToTmp(InstanceInfo ii, String pRepCode, int pRepNo) {
		String upath = ii.getmOwner() + "." + ii.getmLoginUser() + "_" + pRepCode + "_" + pRepNo;
		boolean ret = false;
		UserReports ur = null;
		if (mapUserReports.get(upath) == null)
			return ret;
		ur = mapUserReports.get(upath);
		ObjectMapper mapper = new ObjectMapper();
		String sq = "";
		String sqm = "";
		try {
			int totsq = 0;
			int totsqm = 0;
			String pmx = "";
			String pmv = "";
			String fpmx = "";
			int fldp = 3;
			for (String pmstr : ur.params.keySet()) {
				fpmx += (fpmx.length() > 0 ? "," : "") + "field" + (fldp++);
//				pmx += (pmx.length() > 0 ? "," : "") + pmstr;
				pmv += (pmv.length() > 0 ? "," : "") + "'" + ur.params.get(pmstr) + "==" + pmstr + "'";
			}
			String pmSql = "insert into temporary (idno,usernm,field1,field2," + fpmx + " ) values ";
			pmSql = pmSql + "(8.1,'" + ii.getmLoginUser().toUpperCase() + "','" + pRepCode + "-" + pRepNo + "-999"
					+ "','" + -1 + "', " + pmv + " ); ";

			for (int strq : ur.qrysMetaData.keySet()) {
				System.out.println("qry = " + strq);
				String strdata = ur.qrysMetaData.get(strq).data;
				ObjectMapper objectMapper = new ObjectMapper();
				Reader reader = new StringReader("{" + strdata + "}");
				ObjectNode node = objectMapper.readValue(reader, ObjectNode.class);
//				 JsonNode data = node.get("data");
//				 node.get("data").get(0).fields().next()

				for (int i = 0; i < node.get("metadata").size(); i++) {
					String flds = "";
					String vals = "";
					Iterator<String> itr = node.get("metadata").get(i).fieldNames();
					List<String> lst = new ArrayList<String>();
					int fldno = 0;
					// field1 =rep.code, field2=repno
					while (itr.hasNext()) {
						fldno++;
						String fld = itr.next();
						flds = flds + (flds.length() > 0 ? "," : "") + "field" + (fldno + 2);
						vals = vals + (vals.length() > 0 ? "," : "") + "'" + node.get("metadata").get(i).get(fld) + "'";

					}
					flds = "field1,field2," + flds;
					vals = "8.1,'" + ii.getmLoginUser().toUpperCase() + "','" + pRepCode + "-" + pRepNo + "-[" + strq
							+ "]" + "'," + totsqm + "," + vals.replaceAll("\"", "");
					sqm = sqm + ("insert into temporary (idno,usernm," + flds + ") values (" + vals + ");");
//					System.out.println(("insert into temporary (idno,usernm," + flds + ") values (" + vals + ");"));
					totsqm++;
				}

				for (int i = 0; i < node.get("data").size(); i++) {
					String flds = "";
					String vals = "";
					Iterator<String> itr = node.get("data").get(i).fieldNames();
					List<String> lst = new ArrayList<String>();
					int fldno = 0;
					// field1 =rep.code, field2=repno
					while (itr.hasNext()) {
						fldno++;
						String fld = itr.next();
						flds = flds + (flds.length() > 0 ? "," : "") + "field" + (fldno + 2);
						vals = vals + (vals.length() > 0 ? "," : "") + "'" + node.get("data").get(i).get(fld) + "'";

					}
					flds = "field1,field2," + flds;
					vals = "8.1,'" + ii.getmLoginUser().toUpperCase() + "','" + pRepCode + "-" + pRepNo + "-" + strq
							+ "'," + totsq + "," + vals.replaceAll("\"", "");
					sq = sq + ("insert into temporary (idno,usernm," + flds + ") values (" + vals + ");");
//					System.out.println(("insert into temporary (idno,usernm," + flds + ") values (" + vals + ");"));
					totsq++;
				}
			}
			String delst = "delete from temporary where idno=8.1 and usernm='" + ii.getmLoginUser().toUpperCase()
					+ "' and field1 like '" + pRepCode + "-" + pRepNo + "-%';";
			sq = "begin " + delst + pmSql + sqm + sq + " end;";
			Connection con = ii.getmDbc().getDbConnection();
			con.setAutoCommit(false);
			utils.execSql(sq, con);
			con.commit();
			System.out.println("Total sql : " + totsq);

		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			System.out.println(sq);
		}

		return true;
	}

	public String clearReport(InstanceInfo ii, String pRepCode, int pRepNo) {
		String upath = ii.getmOwner() + "." + ii.getmLoginUser() + "_" + pRepCode + "_" + pRepNo;
		String ret = "";
		UserReports ur = null;
		if (mapUserReports.get(upath) == null)
			return "SUCCESS";
		ur = mapUserReports.get(upath);
		ur.qrysMetaData.clear();
		this.mapUserReports.remove(upath);
		this.listUserReports.remove(ur);
		System.gc();
		return "SUCCESS";
	}

}
