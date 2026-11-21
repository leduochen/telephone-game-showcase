# Data sources and attribution

## 50-input experiment

| Source | Included recordings | Attribution | Published license |
| --- | ---: | --- | --- |
| [LibriSpeech](https://www.openslr.org/12/) | 15 | Vassil Panayotov, Guoguo Chen, Daniel Povey and Sanjeev Khudanpur. *LibriSpeech: An ASR corpus based on public domain audio books*, 2015. | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| [VoxPopuli](https://github.com/facebookresearch/voxpopuli) | 17 | Changhan Wang et al. *VoxPopuli*, ACL 2021; source recordings from the European Parliament. | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/); data license, distinct from the code/model license. [Saved notice](licenses/VoxPopuli-source-license.txt). |
| [Audio MultiChallenge](https://huggingface.co/datasets/ScaleAI/audiomc) | 12 | Advait Gosai et al. *Audio MultiChallenge*, 2025; Scale AI. Only the first human user turn of each selected recording is included. | MIT, as declared by the publisher’s dataset card. No separate LICENSE file was present in the pinned dataset revision. |
| [AMI](https://groups.inf.ed.ac.uk/ami/corpus/) | 6 | AMI Consortium; Carletta et al., *The AMI Meeting Corpus*, 2005. Published individual-headset-microphone segments distributed by edinburghcstr. | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). [Saved publisher notice](licenses/AMI-license.html). |

Published continuous source segments were converted to mono PCM16 and resampled to 24 kHz for the experiment. This website uses AAC playback copies at 48 kb/s. It does not trim, normalize gain, alter pitch, or change playback speed. Publisher transcripts are preserved separately from independent ASR transcripts. The voices heard after H0 are model-generated retellings.

## Emotion and prosody examples

| Source | Included pairs | Attribution / publication | Published license |
| --- | ---: | --- | --- |
| [DEBATE](https://zenodo.org/records/15609922) | 4 | Haotian Guo, Jing Han, Yongfeng Tu, Shihao Gao, Shengfan Shen, Wulong Xiang, Weihao Gan and Zixing Zhang. DEBATE, version 1, Zenodo record 15609922. Mandarin human recordings of prosodic boundaries. | [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) |
| [IUDvPP](https://github.com/KwekuYamoah/IUDvPP) | 1 | IUDvPP authors, repository maintained by Kweku Yamoah. Human instruction recordings from participant pid_f05. | [MIT repository notice](licenses/IUDvPP-LICENSE.txt); no separate audio license was published. |
| [ContraProST](https://github.com/apple-aiml-research/ml-speech-is-more-than-words) | 1 | Apple’s *Speech Is More Than Words* / ContraProST dataset authors. [Publication](https://aclanthology.org/2024.wmt-1.119/). Source audio is the publisher’s existing synthesized speech. | [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/). [Saved publisher license](licenses/ContraProST-LICENSE.txt). |

The experiment resampled these sources to mono 24 kHz PCM16. The website losslessly stores the experiment source and output WAV samples in FLAC; decoded PCM equality was verified for every exported FLAC. Source scripts remain in their original language. English meaning descriptions follow the source metadata. Model-generated retellings are explicitly presented as experiment outputs, separately from the publisher’s source recordings.

This is a noncommercial research sample showcase. The source recordings retain their original licenses and attribution; no blanket license is applied to the dataset assets. Exact source revisions, archive members where applicable, and publication links are in [provenance.json](assets/data/provenance.json).
