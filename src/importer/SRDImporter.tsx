import {importSpells} from "../service/SpellListService";
import React, {JSX, useState} from "react";

import {Spell, SpellComponent} from "../db/Types";

interface SpellFromDb {
    index: string;
    name: string;
    desc: string[];
    higher_level?: string[];
    range: string;
    components: SpellComponent[];
    material?: string;
    concentration: boolean;
    ritual: boolean;
    duration: string;
    casting_time: string;
    level: number;
    school: {index: string, name: string};
    classes: { index: string; name: string }[];
    subclasses: {index: string; name: string}[]
}

export function SRDImporter(): JSX.Element {
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0]; // Safely access the first file
        if (file) {
            setFileName(file.name);

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result as string; // Ensure the result is a string
                    const data: SpellFromDb[] = JSON.parse(text); // Parse JSON data
                    const newData : Spell[] = [];
                    data.forEach( spell =>{
                        newData.push({
                            index: spell.index,
                            casting_time: spell.casting_time,
                            classes: spell.classes.map(myClass => myClass.name),
                            components: spell.components,
                            desc: spell.desc,
                            concentration: spell.concentration,
                            duration: spell.duration,
                            higher_level: spell.higher_level,
                            level: spell.level,
                            name: spell.name,
                            material: spell.material,
                            range: spell.range,
                            ritual: spell.ritual,
                            school: spell.school.name,
                            subclasses: spell.subclasses.map(subClass => subClass.name)
                        })
                    })

                    importSpells(newData); // Update state with parsed JSON
                } catch (error) {
                    console.error('Error parsing JSON file:', error);
                    alert('Invalid JSON file.');
                }
            };
            reader.readAsText(file); // Read file content as text
        }
    };

    const handleButtonClick = (): void => {
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) {
            fileInput.click(); // Trigger file input click
        }
    };


    return (
        <div>
            <button onClick={handleButtonClick}>Import File</button>
            <input
                type="file"
                id="fileInput"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept=".json" // Restrict to certain file types
            />
            {fileName && <p>Selected File: {fileName}</p>}
        </div>
    );
}