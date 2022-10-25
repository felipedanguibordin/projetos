import React, { useEffect } from 'react';
import Tmbd from './Tmbd';
import MovieRow from './components/MovieRow';

export default () => {

    const [movieList, setMovieList] = useState([]);

    useEffect(() => {
        const loadAll = async () => {
            // Pegando a lista total
            let list = await Tmbd.getHomeList();
            setMovieList(list);
        }

        loadAll();
    }, []);

    return(
        <div className='page'>
            <section className='lists'>
                {movieList.map((item, key)=>(
                    <MovieRow key={key} title={item.title} items={item.items}/>
                ))}
            </section>
        </div>
    )
}