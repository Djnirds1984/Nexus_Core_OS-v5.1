import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  serverTimestamp,
  type DocumentData,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Firewall Rules
export const subscribeToFirewallRules = (callback: (rules: any[]) => void) => {
  const q = query(collection(db, 'firewall_rules'), orderBy('priority', 'asc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'firewall_rules'));
};

export const addFirewallRule = async (rule: any) => {
  try {
    return await addDoc(collection(db, 'firewall_rules'), {
      ...rule,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'firewall_rules');
  }
};

export const deleteFirewallRule = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'firewall_rules', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `firewall_rules/${id}`);
  }
};

// VPN Configs
export const subscribeToVPNConfigs = (callback: (configs: any[]) => void) => {
  return onSnapshot(collection(db, 'vpn_configs'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'vpn_configs'));
};

export const addVPNConfig = async (config: any) => {
  try {
    return await addDoc(collection(db, 'vpn_configs'), {
      ...config,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'vpn_configs');
  }
};

export const deleteVPNConfig = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'vpn_configs', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `vpn_configs/${id}`);
  }
};

// Traffic Analysis
export const subscribeToLivePackets = (callback: (packets: any[]) => void) => {
  const q = query(collection(db, 'packet_captures'), orderBy('timestamp', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'packet_captures'));
};

// Mock traffic generator (for demo purposes if real traffic isn't flowing)
export const simulatePacket = async () => {
  const protocols = ['TCP', 'UDP', 'ICMP', 'HTTPS', 'DNS', 'SSH'];
  const srcIps = ['192.168.1.45', '192.168.1.12', '10.0.0.5', '203.0.113.45', '192.168.1.102'];
  const dstIps = ['104.26.14.77', '8.8.8.8', '1.1.1.1', 'Nexus Core', 'Office-Uplink'];
  
  const packet = {
    timestamp: new Date().toISOString(),
    src_ip: srcIps[Math.floor(Math.random() * srcIps.length)],
    dst_ip: dstIps[Math.floor(Math.random() * dstIps.length)],
    src_port: Math.floor(Math.random() * 65535),
    dst_port: [80, 443, 22, 53, 3000][Math.floor(Math.random() * 5)],
    protocol: protocols[Math.floor(Math.random() * protocols.length)],
    size: Math.floor(Math.random() * 1500),
    flags: 'ACK, PSH'
  };

  try {
    await addDoc(collection(db, 'packet_captures'), packet);
  } catch (error) {
    // Silence errors for simulation
  }
};

// PPPoE Servers
export const subscribeToPPPoEServers = (callback: (servers: any[]) => void) => {
  return onSnapshot(collection(db, 'pppoe_servers'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'pppoe_servers'));
};

export const addPPPoEServer = async (server: any) => {
  try {
    return await addDoc(collection(db, 'pppoe_servers'), {
      ...server,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'pppoe_servers');
  }
};

export const updatePPPoEServer = async (id: string, data: any) => {
  try {
    const docRef = doc(db, 'pppoe_servers', id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `pppoe_servers/${id}`);
  }
};

export const deletePPPoEServer = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'pppoe_servers', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `pppoe_servers/${id}`);
  }
};

// PPPoE Subscribers
export const subscribeToPPPoEUsers = (callback: (users: any[]) => void) => {
  return onSnapshot(collection(db, 'pppoe_users'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'pppoe_users'));
};

export const addPPPoEUser = async (user: any) => {
  try {
    return await addDoc(collection(db, 'pppoe_users'), {
      ...user,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'pppoe_users');
  }
};

export const updatePPPoEUser = async (id: string, data: any) => {
  try {
    const docRef = doc(db, 'pppoe_users', id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `pppoe_users/${id}`);
  }
};

export const deletePPPoEUser = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'pppoe_users', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `pppoe_users/${id}`);
  }
};

// PPPoE Sessions
export const subscribeToPPPoESessions = (callback: (sessions: any[]) => void) => {
  return onSnapshot(collection(db, 'pppoe_sessions'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'pppoe_sessions'));
};

export const terminatePPPoESession = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'pppoe_sessions', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `pppoe_sessions/${id}`);
  }
};

export const simulatePPPoESession = async (username: string) => {
  const session = {
    username,
    remote_ip: `100.64.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`,
    interface: 'pppoe-out1',
    mac: `${Math.floor(Math.random()*16).toString(16)}0:${Math.floor(Math.random()*16).toString(16)}0:${Math.floor(Math.random()*16).toString(16)}0:4e:3d:12`,
    uptime: '00:12:45',
    rx_bytes: Math.floor(Math.random() * 1000000),
    tx_bytes: Math.floor(Math.random() * 500000),
    createdAt: serverTimestamp()
  };
  try {
    await addDoc(collection(db, 'pppoe_sessions'), session);
  } catch (error) {
    // simulation error ignored
  }
};

// IPoE Configs
export const subscribeToIPoEConfigs = (callback: (configs: any[]) => void) => {
  return onSnapshot(collection(db, 'ipoe_configs'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'ipoe_configs'));
};

export const addIPoEConfig = async (config: any) => {
  try {
    return await addDoc(collection(db, 'ipoe_configs'), {
      ...config,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'ipoe_configs');
  }
};

export const updateIPoEConfig = async (id: string, data: any) => {
  try {
    const docRef = doc(db, 'ipoe_configs', id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `ipoe_configs/${id}`);
  }
};

export const deleteIPoEConfig = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'ipoe_configs', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `ipoe_configs/${id}`);
  }
};

// Hotspot Servers
export const subscribeToHotspotServers = (callback: (servers: any[]) => void) => {
  return onSnapshot(collection(db, 'hotspot_servers'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'hotspot_servers'));
};

export const addHotspotServer = async (server: any) => {
  try {
    return await addDoc(collection(db, 'hotspot_servers'), {
      ...server,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'hotspot_servers');
  }
};

export const deleteHotspotServer = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'hotspot_servers', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `hotspot_servers/${id}`);
  }
};

// Hotspot Vouchers
export const subscribeToHotspotVouchers = (callback: (vouchers: any[]) => void) => {
  return onSnapshot(collection(db, 'hotspot_vouchers'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'hotspot_vouchers'));
};

export const addHotspotVoucher = async (voucher: any) => {
  try {
    return await addDoc(collection(db, 'hotspot_vouchers'), {
      ...voucher,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'hotspot_vouchers');
  }
};

export const generateBatchVouchers = async (count: number, profile: string, dataLimit: number) => {
  const vouchers = [];
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    vouchers.push({
      code,
      password: code,
      profile,
      data_limit: dataLimit,
      status: 'available',
      createdAt: new Date().toISOString()
    });
  }
  
  // For demo simplicity, we add them individually. In production use writeBatch.
  for (const v of vouchers) {
    await addHotspotVoucher(v);
  }
};

export const deleteHotspotVoucher = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'hotspot_vouchers', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `hotspot_vouchers/${id}`);
  }
};

// Hotspot Active Sessions
export const subscribeToHotspotActive = (callback: (active: any[]) => void) => {
  return onSnapshot(collection(db, 'hotspot_active'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'hotspot_active'));
};

export const terminateHotspotSession = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'hotspot_active', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `hotspot_active/${id}`);
  }
};

export const simulateHotspotLogin = async (user: string, mac: string) => {
  const session = {
    user,
    mac_address: mac,
    address: `192.168.88.${Math.floor(Math.random() * 254) + 1}`,
    uptime: '00:05:21',
    bytes_in: Math.floor(Math.random() * 500000),
    bytes_out: Math.floor(Math.random() * 200000),
    login_by: 'http-chap',
    createdAt: serverTimestamp()
  };
  try {
    await addDoc(collection(db, 'hotspot_active'), session);
  } catch (error) {
    // silence
  }
};

// Hotspot Portals
export const subscribeToHotspotPortals = (callback: (portals: any[]) => void) => {
  return onSnapshot(collection(db, 'hotspot_portals'), (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'hotspot_portals'));
};

export const updateHotspotPortal = async (id: string, data: any) => {
  try {
    const docRef = doc(db, 'hotspot_portals', id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `hotspot_portals/${id}`);
  }
};

export const addHotspotPortal = async (portal: any) => {
  try {
    return await addDoc(collection(db, 'hotspot_portals'), {
      ...portal,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'hotspot_portals');
  }
};
