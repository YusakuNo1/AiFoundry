import React from 'react';
import { Text, Link } from "@fluentui/react-components";


type Props = {
}
const LmProviderUpdatePageOllama = (props: Props) => {
    return (<Text style={{ width: "100%", marginTop: "32px", marginBottom: "64px", marginLeft: "8px", marginRight: "8px" }}>
        Download <Link href='https://ollama.com/download'>Ollama</Link> and then run it "ollama serve" in Terminal
    </Text>)
};

export default LmProviderUpdatePageOllama;
