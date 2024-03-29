//query varie
const { Op } = require("sequelize");
const { sequelize } = require("sequelize");
const { QueryTypes } = require('sequelize');
const path = require('path');
const db = require("../model");
var bcrypt = require("bcryptjs");


const Utente = db.Utente;
const Permesso = db.Permesso;
const Pagamento = db.Pagamento;
const Parcheggio = db.Parcheggio;
const Prenotazione = db.Prenotazione;
const Veicolo = db.Veicolo;
const Immagine = db.Immagine;
const NotificheRitardo = db.NotificheRitardo;


//funzione per generare la password
function generaPassword() {
  var length = 10,
      charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+={}[]]",
      retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

//req.query per get
//req.body per post
//req.params per roba con parametri nell'url

//Homepage
  exports.Homepage = (req, res) => {
    res.status(200).sendFile('/home/uberazzi/codice/server/build/index.html');
  };
  //Pagamento
  exports.Pagamento = (req, res) => {
    res.status(200).sendFile('/home/uberazzi/codice/server/build/Pagamento/invoice.html');
  };


  exports.body = (req, res) => {
    console.log(req.body)
    console.log(req.query)
    res.status(200).send({message : req.body});
  };
//Pagina Profilo:
//Query: ultime tre prenotazioni con ritorno id, data e stato
//aggiornare dati utente
//lista prenotazioni ritorna i dati delle ultime 3 prenotazioni effettuate
exports.ultime_prenotazioni = (req, res) => {
  Prenotazione.findAll({
    where: {
      IDCliente: req.query.IDUtente
    },
    order:[['IDPrenotazione', 'DESC']],
    include:[{
      model: Veicolo
    }],
    limit:3
  })
    .then(ultime_prenotazioni => {
      if (!ultime_prenotazioni) {
        return res.status(404).send({ message: "nessuna prenotazione effettuata." });
      }    
    res.status(200).send(
      ultime_prenotazioni
    )})
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};
//Aggiorna dati utente:
exports.ModificaDati = (req, res) => {
  Utente.update({
    CartaIdentita: req.body.CartaIdentita,
    Indirizzo: req.body.Indirizzo,
    CAP: req.body.CAP,
    Email: req.body.Email,
    NumeroPatente: req.body.NumeroPatente,
    TipoPatente: req.body.TipoPatente,
  },
    {
    where: {
      IDUtente: req.query.IDUtente
    },
  })
  .then(
    res.status(200).send({ message:"Dati profilo modificati" })
    )
  .catch(err => {
    res.status(500).send({ message: err.message });
  });
};


//Pagina prenotazioni
//Selezionare tutte le prenotazioni 
exports.prenotazioni = (req, res) => {
  Prenotazione.findAll({
    where: {
      IDCliente: req.query.IDUtente
    },
    order:[['DataOra', 'DESC']],
    include:[{
      model: Veicolo
    }]
  })
    .then(prenotazioni => {
      if (!prenotazioni) {
        return res.status(404).send({ message: "nessuna prenotazione effettuata." });
      }
    
    res.status(200).send(
      prenotazioni
    )})
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

//modifica prenotazioni
//seleziona la prenotazione singola e ritornane i dati
exports.dettagli_prenotazione = (req, res) => {
  Prenotazione.findOne({
    where: {
      IDPrenotazione: req.query.IDPrenotazione
    },
    order:[['DataOra', 'DESC']],
    include:[{
      model: Veicolo
    }]
  })
    .then(dettagli_prenotazione => {
      if (!dettagli_prenotazione) {
        return res.status(404).send({ message: "nessuna prenotazione effettuata." });
      }
    
    res.status(200).send(
      dettagli_prenotazione
    )})
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};
//modifica prenotazione
exports.salvaPrenotazione = (req, res) => {
  Prenotazione.update({
    Partenza:req.body.Partenza,
    Arrivo:req.body.Arrivo,
    Stato: "Attiva",
    DataOra:req.query.DataOra,
    DataOraArrivo:req.query.DataOraArrivo,
    Autista:req.query.Autista,
    IDVeicolo:req.body.IDVeicolo,
    Consegnato:false
  },{
    where: {
      IDPrenotazione: req.query.IDPrenotazione
    }
  })
    .then(    
    res.status(200).send({ message:"Prenotazione modificata" })
    )
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};


//nuova prenotazione
//creazione nuova riga nelle prenotazioni
exports.nuova_prenotazione = (req, res) => {
  // Crea prenotazione nel database
  Prenotazione.create({
    IDCliente: req.headers["idutente"],
    Partenza:req.body.Partenza,
    Arrivo:req.body.Arrivo,
    Stato: "Sospesa",
    DataOra:req.query.DataOra,
    DataOraArrivo:req.query.DataOraArrivo,
    Autista:req.query.Autista,
    IDVeicolo:req.body.IDVeicolo,
    Consegnato:false,
  })
  .then( res.status(200).send({ message:"Prenotazione creata" }))
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

//query enorme per cercare i veicoli disponibili incrociando i dati delle prenotazioni e dei veicoli
exports.DisponibilitaVeicoli = (req, res) => {
  Prenotazione.findAll({
    attributes: ['IDVeicolo'],
    distinct: true,
    nested: false,
    where: {
      DataOra:{[Op.gte] : req.query.Partenza},
      DataOraArrivo: {[Op.lte] : req.query.Arrivo}
    },
    include:[{
      model: Veicolo
    }]
  })
    .then(veicoli_disponibili => {
      if (!veicoli_disponibili) {
        return res.status(404).send({
           message: "nessun veicolo effettuata." 
          });
        }
    res.status(200).send(
      veicoli_disponibili
    )})
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};


exports.lista_veicoli = (req, res) => {
  Veicolo.findAll({})
    .then(veicoli => {
      if (!veicoli) {
        return res.status(404).send({ message: "nessun veicolo." });
      }    
      res.status(200).send(veicoli)
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

//se un veicolo non è prenotato allora si rende disponibile

//recupero password

exports.VerificaEmail = (req, res) => {
  Utente.findOne({
    where: {
      Email: req.query.Email
    }
  })
    //controllo dell'esistenza di un profilo Utente
    .then(esistenza_email => {
      if (!esistenza_email) {
        return res.status(404).send({ message: "Utente non trovato." });
      }
      return res.status(200).send({ message: "Mail Esistente." });
    })
    //catch di errore generico tipo 500
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

//notifica ritardo
//creare nuova riga nella notifica ritardo
exports.inviaNotifica = (req, res) => {
  // Crea notifica ritardo nel database
  NotificheRitardo.create({
    IDPrenotazione: req.query.IDPrenotazione,
    Note: req.query.note,
    RuoloUtente: req.query.Ruolo
  })
  .then( res.status(200).send({ message:"notifica creata" }))
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.consegne_veicoli_cliente = (req, res) => {
  Prenotazione.findAll({
    where: {
      IDCliente : req.headers["idutente"],
      Consegnato: true,
      Stato:"Veicolo Ritirato"
    },
    include:[{
      model: Veicolo
    }]
  })
    .then(consegne_veicoli => {
      if (!consegne_veicoli) {
        return res.status(404).send({ message: "nessun veicolo disponibile." });
      }

    res.status(200).send(
      consegne_veicoli
      )})
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.prezzo_veicolo = (req, res) => {
  Veicolo.findOne({
    where: {
      IDVeicolo : req.query.IDVeicolo,
    },
  })
    .then(prezzo_veicolo => {
      if (!prezzo_veicolo) {
        return res.status(404).send({ message: "nessun veicolo disponibile." });
      }
    res.status(200).send(
      prezzo_veicolo
      )})
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.dettagli_prenotazione_pagamento = (req, res) => {
  Pagamento.findOne({
    where: {
      IDPrenotazione : req.query.IDPrenotazione,
    },
  })
    .then(dettagli_prenotazione_pagamento => {
      if (!dettagli_prenotazione_pagamento) {
        return res.status(404).send({ message: "nessun veicolo disponibile." });
      }
    res.status(200).send(
      dettagli_prenotazione_pagamento
      )})
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.immagine = (req, res) => {
  Immagine.findAll({
    where: {
      IDVeicolo : req.query.IDVeicolo
    },
    order:[['IDImmagine', 'DESC']]
  })
    .then(immagine => {
      if (!immagine) {
        return res.status(404).send({ message: "nessun immagine disponibile." });
      }

    res.status(200).send(
      immagine
      )})
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};


exports.veicoli_ritirabili_cliente = (req, res) => {
  Prenotazione.findAll({
    where: {
      IDCliente : req.headers["idutente"],
      Stato: "Veicolo Consegnato",
      Consegnato: true,
    },
    include:[{
      model: Veicolo
    }]
  })
    .then(veicoli_ritirabili => {
      if (!veicoli_ritirabili) {
        return res.status(404).send({ message: "nessun veicolo disponibile." });
      }

    res.status(200).send(
      veicoli_ritirabili
      )})
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};


exports.consegna_veicolo_Cliente = (req, res) => {
  Prenotazione.update({
      Stato: "Veicolo Riconsegnato"
  },{
    where: {
      IDPrenotazione: req.query.IDPrenotazione
    }
  })
    .then(    
    res.status(200).send({ message:"consegna effettuata" })
    )
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.ritira_veicolo_Cliente = (req, res) => {
  Prenotazione.update({
      Stato: "Veicolo Ritirato"
  },{
    where: {
      IDPrenotazione: req.query.IDPrenotazione
    }
  })
    .then(    
    res.status(200).send({ message:"veicolo Ritirato" })
    )
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};


exports.recupera_password = (req, res) => {
  let newpass = generaPassword();
  Utente.update({
      password: bcrypt.hashSync(newpass, 8),
  },{
    where: {
      Email: req.query.Email
    }
  })
    .then(    
    res.status(200).send({ message:"password resettata, verifica nel log", password: newpass })
    )
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

//nuovo pagamento
//creazione nuova riga nei pagamenti
exports.nuovo_pagamento = (req, res) => {
  // Crea pagamento nel database
  Pagamento.create({
    IDPrenotazione: req.query.IDPrenotazione,
    Importo: req.query.Importo,
  })
  .then( res.status(200).send({ message:"Pagamento creato" }))
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.aggiorna_stato_prenotazione_cliente = (req, res) => {
  Prenotazione.update({
    Stato:req.query.Stato
  },{
    where: {
      IDPrenotazione:req.query.IDPrenotazione
    }
  })
    .then(
      res.status(200).send({ message: "Prenotazione aggiornata" })
      )
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.ultime_notifiche_cliente = (req, res) => {
  Prenotazione.findAll({
    where: {
      IDCliente: req.headers["idutente"],
      Stato: {[Op.ne]:"conclusa"}
    },
    order:[['DataOra', 'DESC']],
    include:[{
      model: NotificheRitardo
    }],
  })
    .then(ultime_notifiche => {
      if (!ultime_notifiche) {
        return res.status(404).send({ message: "nessuna notifica." });
      }    
    res.status(200).send(
      ultime_notifiche
    )})
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.info_veicolo = (req, res) => {
  Veicolo.findAll({
    where: {
      IDVeicolo: req.query.IDVeicolo
    }
  })
    .then(info_veicolo => {
      if (!info_veicolo) {
        return res.status(404).send({ message: "nessun veicolo." });
      }    
      res.status(200).send(info_veicolo)}
    )
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.aggiorna_pagamento = (req, res) => {
  Pagamento.update({
    Importo:req.query.Importo
  },{
    where: {
      IDPrenotazione:req.query.IDPrenotazione
    }
  })
    .then(
      res.status(200).send({ message: "Prenotazione aggiornata" })
      )
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};