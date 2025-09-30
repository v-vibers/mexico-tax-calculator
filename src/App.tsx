import { useSubscribeDev } from '@subscribe.dev/react';
import { SignInScreen } from './components/SignInScreen';
import { TaxCalculatorApp } from './components/TaxCalculatorApp';
import './App.css'

function App() {
  const { isSignedIn, signIn } = useSubscribeDev();

  if (!isSignedIn) {
    return <SignInScreen signIn={signIn} />;
  }

  return <TaxCalculatorApp />;
}

export default App
