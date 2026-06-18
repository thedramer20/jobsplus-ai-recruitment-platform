package com.jobplus.config;

import javax.net.SocketFactory;
import java.io.IOException;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.net.Proxy;
import java.net.Socket;

/**
 * SocketFactory that opens connections through a SOCKS5 proxy using an UNRESOLVED
 * address, so the destination hostname is sent to the proxy for remote DNS resolution
 * (like curl's --socks5-hostname). This is required behind the GFW with Clash, where
 * local DNS returns an unroutable fake-IP for blocked hosts like smtp.gmail.com.
 *
 * Proxy host/port are read from system properties set by {@link MailProxyConfig}.
 * JavaMail instantiates this via the static getDefault() method
 * (mail.smtp.socketFactory.class).
 */
public class SocksProxySocketFactory extends SocketFactory {

    private static final SocksProxySocketFactory DEFAULT = new SocksProxySocketFactory();

    public static SocketFactory getDefault() {
        return DEFAULT;
    }

    private Proxy proxy() {
        String host = System.getProperty("jobplus.mail.socks.host");
        int port = Integer.parseInt(System.getProperty("jobplus.mail.socks.port", "1080"));
        return new Proxy(Proxy.Type.SOCKS, new InetSocketAddress(host, port));
    }

    private Socket connectedThroughProxy(String host, int port) throws IOException {
        Socket socket = new Socket(proxy());
        // Unresolved -> the SOCKS5 proxy resolves the hostname remotely (avoids local fake-IP).
        socket.connect(InetSocketAddress.createUnresolved(host, port));
        return socket;
    }

    @Override
    public Socket createSocket() {
        return new Socket(proxy());
    }

    @Override
    public Socket createSocket(String host, int port) throws IOException {
        return connectedThroughProxy(host, port);
    }

    @Override
    public Socket createSocket(String host, int port, InetAddress localHost, int localPort) throws IOException {
        return connectedThroughProxy(host, port);
    }

    @Override
    public Socket createSocket(InetAddress host, int port) throws IOException {
        return connectedThroughProxy(host.getHostName(), port);
    }

    @Override
    public Socket createSocket(InetAddress address, int port, InetAddress localAddress, int localPort) throws IOException {
        return connectedThroughProxy(address.getHostName(), port);
    }
}
