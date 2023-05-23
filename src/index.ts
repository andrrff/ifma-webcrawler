import express, {Request, Response} from "express";
import { crawler } from "./controller/crawlerController";
import { DBContext } from "./services/DBContext";
import _ from 'lodash';

const app     = express();
const port    = 8080;

DBContext.getInstance().connect();

app.use(express.json());

app.post("/api/robot", (req, res) => {
    crawler.queue(req.body);

    res.send("Crawling started");
});

app.get('/search', (req: Request, res: Response) => {
  const searchTerm = req.query.q as string;

  const dictionary = DBContext.getInstance().getCollectionDictionary().find().toArray();

  dictionary.then((data) => {
        // Filtrar os dados com base na palavra de busca
        // const dadosFiltrados = data.filter(item => item.word.includes(searchTerm));

        // Dividir a string de busca em palavras separadas
        const searchWords = searchTerm.split(' ');

        // Filtrar os dados com base nas palavras de busca
        const dadosFiltrados = data.filter(item => {
        if (!item.word) {
            return false;
        }
        const word = item.word.toLowerCase();
        return searchWords.some(searchWord => word.includes(searchWord.toLowerCase()));
        });

        // Mapear os índices e seus respectivos GUIDs
        const indicesComGUIDs: any[] = [];
        const guidSet = new Set();
        dadosFiltrados.forEach(item => {
        const indexes = Object.entries(item.index);
        indexes.forEach(([index, guid]) => {
            if (!guidSet.has(guid)) {
            guidSet.add(guid);
            indicesComGUIDs.push({ index, guid });
            }
        });
        });

        // Contar a ocorrência dos índices
        const contagemIndices = _.countBy(indicesComGUIDs, 'index');

        // Ordenar os índices por ordem decrescente de contagem
        const indicesOrdenados = Object.entries(contagemIndices)
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([index]) => index);

        // Retornar os índices mais frequentes com seus GUIDs
        const indicesMaisFrequentes = indicesComGUIDs.filter(({ index }) => indicesOrdenados.includes(index));

        res.json({ indicesMaisFrequentes });
    });
});

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});