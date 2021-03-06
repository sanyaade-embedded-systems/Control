/**
 * PhoneGap plugin handling OSC communication in Control
 */
package com.charlieroberts.Control;

import java.io.File;
import java.util.*;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;
import android.view.WindowManager;
import com.phonegap.*;


import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;
import com.phonegap.api.PluginResult.Status;

import java.io.IOException;
import java.net.*;
import java.nio.channels.DatagramChannel;

import java.io.StringWriter;
import java.io.PrintWriter;

import javax.jmdns.JmDNS;
import javax.jmdns.ServiceEvent;
import javax.jmdns.ServiceListener;
import javax.jmdns.ServiceInfo;

import android.app.Activity;
import android.os.Bundle;

public class Bonjour extends Plugin {
    private String type = "_osc._udp.local.";
	JmDNS jmdns;
	ServiceListener listener;

	public Bonjour() {
	    try{
                jmdns = JmDNS.create();
                jmdns.addServiceListener(type, listener = new ServiceListener() {
                    @Override
                    public void serviceResolved(ServiceEvent ev) {
                        System.out.println("Service resolved: "
                                 + ev.getInfo().getQualifiedName()
                                 + " port:" + ev.getInfo().getPort());
                        String jsString = "javascript:destinationManager.addDestination('" + ev.getInfo().getHostAddress() + "'," + ev.getInfo().getPort() + ", 0, 0);";
                        System.out.println(jsString);
                        webView.loadUrl(jsString);
                    }
                    @Override
                    public void serviceRemoved(ServiceEvent ev) {
                        System.out.println("Service removed: " + ev.getName());
                        String jsString = "javascript:destinationManager.removeDestinationWithIPAndPort('" + ev.getInfo().getHostAddress() + "'," + ev.getInfo().getPort() + ");";
                        System.out.println(jsString);
                        webView.loadUrl(jsString);
                    }
                    @Override
                    public void serviceAdded(ServiceEvent event) {
                        // Required to force serviceResolved to be called again
                        // (after the first search)
                        jmdns.requestServiceInfo(event.getType(), event.getName(), 1);
                    }
                });
                
            }catch(Exception e) {
                System.out.println("error starting Bonjour");
            }
	    }
	@Override
	public PluginResult execute(String action, JSONArray data, String callbackId) {
	    //Log.d("OSCManager", "executing something " + action);	
		System.out.println("EXECUTING ********************************************");
		PluginResult result = null;
		if (action.equals("start")) {
		    System.out.println("STARTING ********************************************");
		    
            ServiceInfo[] infos = jmdns.list("_osc._udp.local.");
            for (int i = 0; i < infos.length; i++) {
                String jsString = "javascript:destinationManager.addDestination('" + infos[i].getHostAddress() + "'," + infos[i].getPort() + ", 0, 0);";
                System.out.println(jsString);
                webView.loadUrl(jsString);
                System.out.println("after sending to js");
            }
	    }
		return result;
	}
	
	public String getLocalIpAddress() {
        try {
            for (Enumeration<NetworkInterface> en = NetworkInterface.getNetworkInterfaces(); en.hasMoreElements();) {
                NetworkInterface intf = en.nextElement();
                for (Enumeration<InetAddress> enumIpAddr = intf.getInetAddresses(); enumIpAddr.hasMoreElements();) {
                    InetAddress inetAddress = enumIpAddr.nextElement();
                    if (!inetAddress.isLoopbackAddress()) {
                        System.err.println(inetAddress.getHostAddress().toString());
                    }
                }
            }
        } catch (SocketException ex) {
            System.err.println( "can't get ip" );
        }
        return null;
    }
/*

- (void)pushInterface:(NSValue *)msgPointer;                                                    // DONE
- (void)pushDestination:(NSValue *) msgPointer;                                                 // NOT DONE

- (void)setOSCReceivePort:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;    // DONE
- (void)setIPAddressAndPort:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;  // DONE
- (void)startReceiveThread:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;   // NOT NEEDED
- (void)send:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;                 // DONE
- (void)startPolling:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;         // NOT NEEDED
- (void)stopPolling:(NSMutableArray*)arguments withDict:(NSMutableDictionary*)options;          // NOT NEEDED
*/

}
