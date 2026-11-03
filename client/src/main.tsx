import ReactDOM from 'react-dom/client';

import { App } from './App';

/** @see https://ant.design/docs/react/v5-for-19 */
import '@ant-design/v5-patch-for-react-19';
import './index.css';

const root = document.getElementById('root');

ReactDOM.createRoot(root!).render(<App />);
