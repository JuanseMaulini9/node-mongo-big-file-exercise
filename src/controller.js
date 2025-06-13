const Records = require("./records.model");

// Importar fs para manejar los archivos
const fs = require("fs");

// readline para leer linea por linea sin cargar la memoria
const readline = require("readline");

const upload = async (req, res) => {
  const { file } = req;

  if (!file) {
    return res.status(400).json({ message: "No file was uploaded" });
  }
  try {
    // Se crea un steam para no sobrecargar la memoria
    const stream = fs.createReadStream(file.path);

    // cada vez que se lee una liena del archivo se captura aca
    const rl = readline.createInterface({ input: stream });

    // Se verifica que sea la primera linea del archivo
    let isFirstLine = true;
    // se hace la llamada a cada linea de forma asyncrona para no bloquar la memoria
    for await (const line of rl) {
      // La Primera linea del archivo no se tiene que procesar
      if (isFirstLine) {
        isFirstLine = false;
        continue;
      }

      // Se hace una destructuracion para tener todos los datos
      const [id, firstname, lastname, email, email2, profession] =
        line.split(",");

      // Se crea el objeto new Record como un nuevo registro para la base de datos
      const newRecord = new Records({
        // En el esquema id esta declarado como un number
        id: Number(id),
        firstname,
        lastname,
        email,
        email2,
        profession,
      });
      // si new record se creo correctamente
      if (newRecord) {
        // se manda a guardar en la base de datos
        await newRecord.save();
      } else {
        throw new Error(`Failed to load user ${id}`);
      }
    }
    return res
      .status(201)
      .json({ message: "All records loaded successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }

  /* Acá va tu código! Recordá que podés acceder al archivo desde la constante file */
};

const list = async (_, res) => {
  try {
    const data = await Records.find({}).limit(10).lean();

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json(err);
  }
};

module.exports = {
  upload,
  list,
};
