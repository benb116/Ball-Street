import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { getPlayers, playersSelector, priceMapSelector, filterSelector, sortSelector, setFilter, setSort} from './PlayersSlice';
import { isOnRosterSelector, preAdd, preDrop } from '../Entry/EntrySlice';
import { createOffer, cancelOffer, offersSelector } from '../Offers/OffersSlice';

const Players = () => {
  
  const dispatch = useDispatch();
  const { leagueID, contestID } = useParams();

  const theplayers = useSelector(playersSelector);
  const filters = useSelector(filterSelector);
  const sorts = useSelector(sortSelector);

  const filtersortplayers = theplayers
    .filter(p => p.name.toLowerCase().includes(filters.name))
    .filter(p => {
      if (filters.posName === 'FLEX') {
        return (['RB', 'WR', 'TE'].indexOf(p.posName) > -1);
      }
      return (p.posName === filters.posName || filters.posName === '');
    })
    .filter(p => (p.teamAbr === filters.teamAbr || filters.teamAbr === ''))
    .sort((a,b) => {
      const out = a[sorts.sortProp] > b[sorts.sortProp];
      return (out ? 1 : -1)*(sorts.sortDesc ? 1 : -1);
    });

  useEffect(() => {
    dispatch(getPlayers({leagueID, contestID}));
  }, []);

  return (
    <div className="container mx-auto">
      Players
      <PlayerFilter />
      <table>
        <tbody>
          <ListHeader />
          {filtersortplayers.map(function(player, index){
            return <PlayerItem key={ index } playerdata={ player }/>;
          })}
        </tbody>
      </table>
    </div>
  );
};

function ListHeader() {
  const dispatch = useDispatch();

  function handleClick(evt) {
    console.log(evt.target.getAttribute('value'));
    dispatch(setSort(evt.target.getAttribute('value')))
  }

  return (
    <tr>
      <th onClick={handleClick} value="name">Name</th>
      <th onClick={handleClick} value="posName">Pos</th>
      <th onClick={handleClick} value="teamAbr">Team</th>
      <th onClick={handleClick} value="preprice">Proj</th>
      <th onClick={handleClick} value="statprice">Pts</th>
      <th onClick={handleClick} value="last">Last Trade</th>
      <th onClick={handleClick} value="bid">Best Bid</th>
      <th onClick={handleClick} value="ask">Best Ask</th>
      <th onClick={handleClick} value="add">Add</th>
      <th>Offer</th>
    </tr>
  )
}

function PlayerFilter() {
  const dispatch = useDispatch();
  const filters = useSelector(filterSelector);

  function handleChange(evt) {
    const name = evt.target.name;
    const value = evt.target.value;
    dispatch(setFilter({name, value}))
  }

  return (
    <form>
      <input onChange={handleChange} name="name" value={filters.name}></input>
      <select onChange={handleChange} name="posName" value={filters.posName}>
        <option value="">Pos</option>
        <option value="QB">QB</option>
        <option value="RB">RB</option>
        <option value="WR">WR</option>
        <option value="TE">TE</option>
        <option value="FLEX">FLEX</option>
        <option value="K">K</option>
        <option value="DEF">DEF</option>
      </select>
      <select onChange={handleChange} name="teamAbr" value={filters.team}>
        <option value="">Team</option>
        <option value="ARI">ARI</option>
        <option value="ATL">ATL</option>
        <option value="BAL">BAL</option>
        <option value="BUF">BUF</option>
        <option value="CAR">CAR</option>
        <option value="CHI">CHI</option>
        <option value="CIN">CIN</option>
        <option value="CLE">CLE</option>
        <option value="DAL">DAL</option>
        <option value="DEN">DEN</option>
        <option value="DET">DET</option>
        <option value="GB">GB</option>
        <option value="HOU">HOU</option>
        <option value="IND">IND</option>
        <option value="JAX">JAX</option>
        <option value="KC">KC</option>
        <option value="MIA">MIA</option>
        <option value="MIN">MIN</option>
        <option value="NE">NE</option>
        <option value="NO">NO</option>
        <option value="NYG">NYG</option>
        <option value="NYJ">NYJ</option>
        <option value="LV">LV</option>
        <option value="PHI">PHI</option>
        <option value="PIT">PIT</option>
        <option value="LAC">LAC</option>
        <option value="SF">SF</option>
        <option value="SEA">SEA</option>
        <option value="LAR">LAR</option>
        <option value="TB">TB</option>
        <option value="TEN">TEN</option>
        <option value="WAS">WAS</option>
      </select>
    </form>
  )
}

function PlayerItem(props) {
  const dispatch = useDispatch();
  const { leagueID, contestID } = useParams();
  const offers = useSelector(offersSelector);

  const showDrop = useSelector(isOnRosterSelector(props.playerdata.id));
  const priceMap = useSelector(priceMapSelector(props.playerdata.id));

  const onpredrop = () => {
    dispatch(preDrop({leagueID, contestID, nflplayerID: props.playerdata.id}));
  }

  const onpreadd = () => {
    dispatch(preAdd({leagueID, contestID, nflplayerID: props.playerdata.id}));
  }

  const onask = () => {
    dispatch(createOffer({leagueID, contestID, offerobj: {
      nflplayerID: props.playerdata.id,
      isbid: false,
      price: 900,
      protected: false,
    }}));
  }

  const onbid = () => {
    dispatch(createOffer({leagueID, contestID, offerobj: {
      nflplayerID: props.playerdata.id,
      isbid: true,
      price: 900,
      protected: false,
    }}));
  }

  const playerofferbids = offers.bids.find(o => o.NFLPlayerId === props.playerdata.id);
  const playerofferasks = offers.asks.find(o => o.NFLPlayerId === props.playerdata.id);
  const playeroffer = playerofferbids || playerofferasks;
  const oncancelOffer = (oid) => {
    dispatch(cancelOffer({leagueID, contestID, offerID: oid}))
  }
  return (
    <tr playerid={props.playerdata.id}>
      <td>{props.playerdata.name}</td>
      <td>{props.playerdata.posName}</td>
      <td>{props.playerdata.teamAbr}</td>
      <td>{props.playerdata.preprice}</td>
      <td>{props.playerdata.statprice}</td>
      <td>{priceMap ? priceMap.lastprice : ""}</td>
      <td>{priceMap ? priceMap.bestbid : ""}</td>
      <td>{priceMap ? priceMap.bestask : ""}</td>
      <td onClick={(showDrop ? onpredrop : onpreadd)}>{showDrop ? 'DROP' : 'ADD'}</td>
      {playeroffer ? 
        <td onClick={() => oncancelOffer(playeroffer.id)}>CANCEL</td> :
        <td onClick={(showDrop ? onask : onbid)}>{showDrop ? 'ASK' : 'BID'}</td>
      }
    </tr>
  );
}

export default Players;
