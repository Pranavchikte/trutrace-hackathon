import sqlite3
import hashlib
import datetime

def init_blockchain():
    conn = sqlite3.connect('blockchain.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS ledger
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  content_hash TEXT,
                  timestamp TEXT,
                  content_type TEXT,
                  verification_status TEXT)''')
    conn.commit()
    conn.close()

def add_to_blockchain(content_type, verification_status):
    conn = sqlite3.connect('blockchain.db')
    c = conn.cursor()
    
    timestamp = datetime.datetime.now().isoformat()
    content_hash = hashlib.sha256(f"{timestamp}{content_type}{verification_status}".encode()).hexdigest()
    
    c.execute("INSERT INTO ledger (content_hash, timestamp, content_type, verification_status) VALUES (?, ?, ?, ?)",
              (content_hash, timestamp, content_type, verification_status))
    
    conn.commit()
    conn.close()
    
    return content_hash