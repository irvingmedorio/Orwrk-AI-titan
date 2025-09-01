import os
import logging
import chromadb
from chromadb.config import Settings

# Configure logging
logging.basicConfig(level=logging.INFO)

class VectorStoreManager:
    def __init__(self):
        self.client = None
        self.collection = None
        try:
            host = os.getenv("CHROMA_DB_HOST", "localhost")
            port = int(os.getenv("CHROMA_DB_PORT", "8001")) # Default to 8001 as per docker-compose

            logging.info(f"Connecting to ChromaDB at {host}:{port}...")

            # The client connects to the ChromaDB service running in Docker.
            self.client = chromadb.HttpClient(
                host=host,
                port=port,
                settings=Settings(anonymized_telemetry=False)
            )

            # Create or get a collection. Collections are where you store your embeddings.
            self.collection = self.client.get_or_create_collection(name="onwrk_ai_memory")

            logging.info("Successfully connected to ChromaDB and got collection 'onwrk_ai_memory'.")

        except Exception as e:
            logging.error(f"Failed to connect to ChromaDB: {e}")
            self.client = None

    def add_text(self, text: str, metadata: dict, doc_id: str):
        """
        Adds a text and its metadata to the vector store.
        The text will be automatically converted to an embedding by ChromaDB.
        """
        if not self.client or not self.collection:
            logging.warning("ChromaDB client not available. Cannot add text.")
            return

        try:
            self.collection.add(
                documents=[text],
                metadatas=[metadata],
                ids=[doc_id]
            )
            logging.info(f"Added document with ID '{doc_id}' to ChromaDB.")
        except Exception as e:
            logging.error(f"Failed to add document to ChromaDB: {e}")

    def query_text(self, query_text: str, n_results: int = 5) -> list:
        """
        Queries the vector store for similar texts.
        """
        if not self.client or not self.collection:
            logging.warning("ChromaDB client not available. Cannot query text.")
            return []

        try:
            results = self.collection.query(
                query_texts=[query_text],
                n_results=n_results
            )
            logging.info(f"Queried ChromaDB with '{query_text}' and got {len(results)} results.")
            return results
        except Exception as e:
            logging.error(f"Failed to query ChromaDB: {e}")
            return []

# Create a singleton instance of the manager
vector_store_manager = VectorStoreManager()
