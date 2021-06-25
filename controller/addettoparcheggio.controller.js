//query varie
const { Op } = require("sequelize");
const path = require('path');
const db = require("../model");

const Utente = db.Utente;
const Permesso = db.Permesso;
const Pagamento = db.Pagamento;
const Parcheggio = db.Parcheggio;
const Prenotazione = db.Prenotazione;
const TipoVeicolo = db.TipoVeicolo;
const Veicolo = db.Veicolo;
const Immagine = db.Immagine;
const NotificheRitardo = db.NotificheRitardo;

//req.query per get
//req.body per post
//req.params per roba con parametri nell'url

//consegna veicoli addetto 
//lista delle prenotazioni con macchina non consegnata
exports.consegne_veicoli = (req, res) => {
    Prenotazione.findAll({
      where: {
        Consegnato: false,
        Stato:"attiva"
      },
      include:[{
        model: Veicolo
      }]
    })
      .then(prenotazione => {
        if (!prenotazione) {
          return res.status(404).send({ message: "nessun veicolo disponibile." });
        }
  
      res.status(200).send(
        prenotazione
        )})
      .catch(err => {
        res.status(500).send({ message: err.message });
      });
  };
  //query per aggiornare lo stato dei veicoli 

  exports.aggiorna_stato_veicolo = (req, res) => {
    Veicolo.Update({
      Stato:req.body.Stato
    },{
      where: {
        IDVeicolo:req.query.IDVeicolo
      }
    })
      .then(
        res.status(200).send({ message: "Veicolo aggiornato" })
        )
      .catch(err => {
        res.status(500).send({ message: err.message });
      });
  };

  exports.veicoli_ritirabili = (req, res) => {
    Prenotazione.findAll({
      where: {
        Consegnato: true,
      },
      include:[{
        model: Veicolo
      }]
    })
      .then(prenotazione => {
        if (!prenotazione) {
          return res.status(404).send({ message: "nessun veicolo disponibile." });
        }
  
      res.status(200).send(
        prenotazione
        )})
      .catch(err => {
        res.status(500).send({ message: err.message });
      });
  };

  exports.condizioni_veicoli = (req, res) => {
    Veicolo.findAll({
      where: {
        Consegnato: true,
      },
      include:[{
        model: Veicolo
      }]
    })
      .then(condizioni => {
        if (!condizioni) {
          return res.status(404).send({ message: "nessuna condizione disponibile." });
        };
      res.status(200).send(
        condizioni
        )})
      .catch(err => {
        res.status(500).send({ message: err.message });
      });
  };


  exports.aggiorna_disponibilita_veicolo = (req, res) => {
    Veicolo.Update({
      Prenotabile:req.body.Prenotabile
    },{
      where: {
        IDVeicolo:req.query.IDVeicolo
      }
    })
      .then(
        res.status(200).send({ message: "Veicolo aggiornato" })
        )
      .catch(err => {
        res.status(500).send({ message: err.message });
      });
  };