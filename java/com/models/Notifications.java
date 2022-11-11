package com.models;

import java.io.File;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.controller.InstanceInfo;
import com.generic.DBClass;
import com.generic.Parameter;
import com.generic.QueryExe;
import com.generic.localTableModel;
import com.generic.utils;

public class Notifications {

	Map<String, UserNotifications> mapUN = new HashMap<String, UserNotifications>();

	@Component
	public class UserNotifications extends Thread {
		public InstanceInfo instanceInfo = null;
		private localTableModel mLctb = new localTableModel();
		private Map<String, Object> mMapVars = new HashMap<String, Object>();
		private String mOwner = "";
		private String mOwnerPassword = "";
		private String mOwnerDBUrl = "";

		private String mLoginFile = "";
		private DBClass mDbc = null;
		private Date lastSetupData = null;
		private localTableModel logTb = new localTableModel();

		public UserNotifications(String initFile) {
			this.mLoginFile = initFile;

			try {

				utils.readVars(mMapVars, mLoginFile);
				mOwner = mMapVars.get("ini_owner") + "";
				mOwnerPassword = mMapVars.get("ini_password") + "";
				mOwnerDBUrl = mMapVars.get("ini_dburl") + "";
				mDbc = new DBClass(mOwnerDBUrl, mOwner, mOwnerPassword);
				mLctb.createDBClassFromConnection(this.mDbc.getDbConnection());
				logTb.createDBClassFromConnection(this.mDbc.getDbConnection());
			} catch (Exception e) {
				e.printStackTrace();
			}

		}

		@Override
		public void run() {
			String sq1 = "select *from c7_logs where LOGGED_TIME>?" + " order by keyfld";
			try {
				logTb.parseSQL(sq1);
			} catch (SQLException ex) {
				ex.printStackTrace();
				return;
			}

			while (1 == 1) {
				try {
					Thread.sleep(15000);
					System.out.println("Running notification loop for " + this.mLoginFile);
					this.refreshSetupData();
					if (this.mLctb.getRowCount() <= 0)
						continue;
					Timestamp low = new Timestamp(((Date) this.mLctb.getFieldValue(0, "LAST_NOTIFIED_TIME")).getTime());
					for (int i = 0; i < this.mLctb.getRowCount(); i++) {
						Timestamp ln = new Timestamp(
								((Date) this.mLctb.getFieldValue(i, "LAST_NOTIFIED_TIME")).getTime());
						if (ln.before(low))
							low.setTime(ln.getTime());
					}

					logTb.getDbclass().getStatment().setTimestamp(1, low);
					logTb.executeQuery(sq1, true,true);
					if (logTb.getRowCount() <= 0)
						continue;
					this.mDbc.getDbConnection().setAutoCommit(false);
					for (int i = 0; i < this.mLctb.getRowCount(); i++) {
						String st = this.mLctb.getFieldValue(i, "SETUP_TYPE").toString();
						if (st.startsWith("ACACCOUNT")) {
							_checkAccount(i, logTb);
						}
						if (st.startsWith("JV")) {
							_checkNewJV(i, st, logTb);
						}
						this.mDbc.getDbConnection().commit();
						Thread.sleep(1000);
					}

				} catch (Exception e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}

			}

		}

		public void _checkNewJV(int i, String st, localTableModel logTb) throws Exception {
			String un = this.mLctb.getFieldValue(i, "USERNM").toString();
			String kf = this.mLctb.getFieldValue(i, "KEYFLD").toString();
			String cs = this.mLctb.getFieldValue(i, "CONDITION_STR").toString();
			Timestamp ln = new Timestamp(((Date) this.mLctb.getFieldValue(i, "LAST_NOTIFIED_TIME")).getTime());

			for (int j = 0; j < logTb.getRowCount(); j++) {
				String transType = logTb.getFieldValue(j, "TRANS_TYPE").toString();
				String usernm = logTb.getFieldValue(j, "USERNM").toString();
				String tableName = logTb.getFieldValue(j, "TABLE_NAME").toString();
				String valPara1 = logTb.getFieldValue(j, "VAL_PARA_1").toString();
				String valPara2 = logTb.getFieldValue(j, "VAL_PARA_2").toString();
				String valPara3 = logTb.getFieldValue(j, "VAL_PARA_3").toString();
				Timestamp loggedTime = new Timestamp(((Date) logTb.getFieldValue(j, "LOGGED_TIME")).getTime());

				// new jv
				if (loggedTime.after(ln) && st.equals("JV_NEW") && tableName.equals("ACVOUCHER1")
						&& transType.equals("INSERT") && valPara2.equals(cs)) {
					ln.setTime(loggedTime.getTime());
					utils.insertNotify(this.mDbc.getDbConnection(), un, "JV_NEW",
							"USER #" + usernm + ", NEW JV # " + valPara3 + " !, time : " + ln, "");
					this.mLctb.setFieldValue(i, "LAST_NOTIFIED_TIME", ln);
					QueryExe.execute("update c7_notify_setup set LAST_NOTIFIED_TIME=:LN where keyfld=" + kf,
							this.mDbc.getDbConnection(), new Parameter("LN", ln));

				}
				// posted jv
				if (loggedTime.after(ln) && st.equals("JV_POSTED") && tableName.equals("ACVOUCHER1")
						&& transType.equals("POSTED") && valPara1.equals(cs)) {
					ln.setTime(loggedTime.getTime());
					utils.insertNotify(this.mDbc.getDbConnection(), un, "JV_POSTED",
							"USER #" + usernm + ", POSTED JV # " + valPara3 + " !, time : " + ln, "");
					this.mLctb.setFieldValue(i, "LAST_NOTIFIED_TIME", ln);
					QueryExe.execute("update c7_notify_setup set LAST_NOTIFIED_TIME=:LN where keyfld=" + kf,
							this.mDbc.getDbConnection(), new Parameter("LN", ln));

				}

			}

		}

		public void _checkAccount(int i, localTableModel logTb) throws Exception {
			String un = this.mLctb.getFieldValue(i, "USERNM").toString();
			String kf = this.mLctb.getFieldValue(i, "KEYFLD").toString();
			String cs = this.mLctb.getFieldValue(i, "CONDITION_STR").toString();
			Timestamp ln = new Timestamp(((Date) this.mLctb.getFieldValue(i, "LAST_NOTIFIED_TIME")).getTime());

			for (int j = 0; j < logTb.getRowCount(); j++) {
				String transType = logTb.getFieldValue(j, "TRANS_TYPE").toString();
				String usernm = logTb.getFieldValue(j, "USERNM").toString();
				String tableName = logTb.getFieldValue(j, "TABLE_NAME").toString();
				String valPara1 = logTb.getFieldValue(j, "VAL_PARA_1").toString();
				String valPara2 = logTb.getFieldValue(j, "VAL_PARA_2").toString();
				String valPara3 = logTb.getFieldValue(j, "VAL_PARA_3").toString();
				Timestamp loggedTime = new Timestamp(((Date) logTb.getFieldValue(j, "LOGGED_TIME")).getTime());
				if (loggedTime.after(ln) && tableName.equals("ACACCOUNT") && valPara1.equals(cs)) {
					ln.setTime(loggedTime.getTime());
					utils.insertNotify(this.mDbc.getDbConnection(), un, "ACACCOUNT",
							"USER #" + usernm + ", Account # " + cs + " have " + transType + " !, time : " + ln, "");
					this.mLctb.setFieldValue(i, "LAST_NOTIFIED_TIME", ln);
					QueryExe.execute("update c7_notify_setup set LAST_NOTIFIED_TIME=:LN where keyfld=" + kf,
							this.mDbc.getDbConnection(), new Parameter("LN", ln));

				}
			}

		}

		private void refreshSetupData() throws SQLException, ParseException {
			String vl = utils.getSqlValue(
					"select to_char(max(modified_time),'dd/mm/rrrr hh24:MM:SS') from c7_notify_setup",
					mDbc.getDbConnection());
			if (vl != null && !vl.equals("")) {
				SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:m:s");
				Date ldt = sdf.parse(vl);
				if (this.lastSetupData == null || ldt.after(this.lastSetupData)) {
					mLctb.clearALl();
					mLctb.executeQuery("select *from c7_notify_setup order by keyfld", true);
					System.out.println("Refreshed all c7_notify_setup table....");
					if (this.lastSetupData == null)
						this.lastSetupData = new Date(ldt.getTime());
					else
						this.lastSetupData.setTime(ldt.getTime());
				}

			}

//			if (this.lastSetupData==0){

		}

	}

	private List<String> getInitFiles() {
		List<String> ret = new ArrayList<String>();
//		String path = servletContext.getRealPath("");
		String path = System.getProperty("user.dir") + "/src/main/webapp";
		String fn = "";

		File dir = new File(path);
		for (File file : dir.listFiles()) {
			if (file.getName().endsWith((".ini")))
//				fn += (fn.length() > 0 ? "," : "") + "{ \"file\" :" + "\"" + file.getName() + "\" }";
				ret.add(path + "/" + file.getName());
		}

//		ret.add(fn);

		return ret;
	}

	private boolean started = false;

	public void startAll() {
		if (this.started)
			return;

		List<String> lstFiles = this.getInitFiles();
		for (String file : lstFiles) {
			UserNotifications un = new UserNotifications(file);
			mapUN.put(file, un);
			un.start();
		}
		this.started = true;
	}

	public Notifications() {
		startAll();
	}

}